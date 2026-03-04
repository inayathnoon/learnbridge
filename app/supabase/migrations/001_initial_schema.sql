-- LearnBridge initial schema

create table families (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete cascade unique not null,
  email text not null,
  whatsapp_number text not null,
  whatsapp_verified boolean default false,
  child_name text not null,
  created_at timestamptz default now()
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  "order" int not null
);

create table subsections (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics(id) on delete cascade not null,
  title text not null,
  slug text unique not null,
  "order" int not null,
  walkthrough_steps jsonb default '[]'::jsonb,
  coaching_guide text
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  subsection_id uuid references subsections(id) on delete cascade not null,
  level int check (level between 1 and 4) not null,
  content text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade not null,
  subsection_id uuid references subsections(id) on delete cascade not null,
  started_at timestamptz default now(),
  completed_at timestamptz,
  outcome text check (outcome in ('completed', 'stuck', 'abandoned'))
);

create table question_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  question_id uuid references questions(id) on delete cascade not null,
  level_attempted int not null,
  answer_given text not null,
  correct boolean not null,
  attempted_at timestamptz default now()
);

create table alerts_sent (
  id uuid primary key default gen_random_uuid(),
  family_id uuid references families(id) on delete cascade not null,
  session_id uuid references sessions(id) on delete cascade not null,
  subsection_id uuid references subsections(id) on delete cascade not null,
  sent_at timestamptz default now(),
  meta_message_id text
);

-- RLS policies
alter table families enable row level security;
alter table sessions enable row level security;
alter table question_attempts enable row level security;
alter table alerts_sent enable row level security;
alter table topics enable row level security;
alter table subsections enable row level security;
alter table questions enable row level security;

-- Public read for content tables
create policy "Anyone can read topics" on topics for select using (true);
create policy "Anyone can read subsections" on subsections for select using (true);
create policy "Anyone can read questions" on questions for select using (true);

-- Family-scoped access
create policy "Users can read own family" on families
  for select using (auth_user_id = auth.uid());

create policy "Users can insert own family" on families
  for insert with check (auth_user_id = auth.uid());

create policy "Users can read own sessions" on sessions
  for select using (family_id in (select id from families where auth_user_id = auth.uid()));

create policy "Users can insert own sessions" on sessions
  for insert with check (family_id in (select id from families where auth_user_id = auth.uid()));

create policy "Users can update own sessions" on sessions
  for update using (family_id in (select id from families where auth_user_id = auth.uid()));

create policy "Users can read own attempts" on question_attempts
  for select using (session_id in (
    select s.id from sessions s
    join families f on s.family_id = f.id
    where f.auth_user_id = auth.uid()
  ));

create policy "Users can insert own attempts" on question_attempts
  for insert with check (session_id in (
    select s.id from sessions s
    join families f on s.family_id = f.id
    where f.auth_user_id = auth.uid()
  ));

create policy "Users can read own alerts" on alerts_sent
  for select using (family_id in (select id from families where auth_user_id = auth.uid()));
