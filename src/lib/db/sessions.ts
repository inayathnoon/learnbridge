import { createBrowserClient } from "@supabase/ssr";

function getClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type SessionOutcome = "completed" | "stuck" | "abandoned";

export type Session = {
  id: string;
  family_id: string;
  subsection_id: string;
  started_at: string;
  completed_at: string | null;
  outcome: SessionOutcome | null;
};

export async function createSession(
  familyId: string,
  subsectionId: string
): Promise<Session> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({ family_id: familyId, subsection_id: subsectionId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSessionOutcome(
  sessionId: string,
  outcome: SessionOutcome
): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("sessions")
    .update({ outcome, completed_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) throw error;
}

export async function getLastVisitedSubsection(familyId: string): Promise<{
  topic_slug: string;
  subsection_slug: string;
} | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      subsection_id,
      subsections (
        slug,
        topics ( slug )
      )
    `
    )
    .eq("family_id", familyId)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;

  const sub = data.subsections as unknown as {
    slug: string;
    topics: { slug: string };
  };

  if (!sub?.slug || !sub?.topics?.slug) return null;

  return {
    topic_slug: sub.topics.slug,
    subsection_slug: sub.slug,
  };
}
