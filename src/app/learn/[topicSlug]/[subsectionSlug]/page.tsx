import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { WalkthroughViewer } from "@/features/learn/components/WalkthroughViewer";
import { QuizQuestion } from "@/features/learn/types";

type WalkthroughStep = {
  image_url?: string;
  caption: string;
};

type Props = {
  params: { topicSlug: string; subsectionSlug: string };
};

export default async function LearnSubsectionPage({ params }: Props) {
  const { topicSlug, subsectionSlug } = params;
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const [authResult, topicResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("topics")
      .select("id, order")
      .eq("slug", topicSlug)
      .single(),
  ]);

  const user = authResult.data.user;
  const topic = topicResult.data;

  if (!topic) notFound();

  const { data: subsection } = await supabase
    .from("subsections")
    .select("id, title, slug, order, walkthrough_steps")
    .eq("slug", subsectionSlug)
    .eq("topic_id", topic.id)
    .single();

  if (!subsection) notFound();

  const [questionsResult, allSubsectionsResult, allTopicsResult] =
    await Promise.all([
      supabase
        .from("questions")
        .select("id, level, prompt, options, correct_index, explanation")
        .eq("subsection_id", subsection.id)
        .order("level"),
      // All subsections for this topic (to find next)
      supabase
        .from("subsections")
        .select("id, title, slug, order")
        .eq("topic_id", topic.id)
        .order("order", { ascending: true }),
      // All topics (to find next topic if current is last)
      supabase
        .from("topics")
        .select("id, slug, order, subsections(id, title, slug, order)")
        .order("order", { ascending: true }),
    ]);

  const questions: QuizQuestion[] = (questionsResult.data ?? []).map((q) => ({
    id: q.id as string,
    subsectionId: subsection.id as string,
    level: q.level as QuizQuestion["level"],
    prompt: q.prompt as string,
    options: q.options as string[],
    correctIndex: q.correct_index as number,
    explanation: q.explanation as string | undefined,
  }));

  // Determine the next subsection
  const siblings = allSubsectionsResult.data ?? [];
  const currentIdx = siblings.findIndex((s) => s.id === subsection.id);
  let nextHref: string | null = null;
  let nextTitle: string | null = null;

  if (currentIdx !== -1 && currentIdx < siblings.length - 1) {
    // Next subsection in same topic
    const next = siblings[currentIdx + 1];
    nextHref = `/learn/${topicSlug}/${next.slug}`;
    nextTitle = next.title as string;
  } else {
    // First subsection of next topic
    type TopicRow = {
      id: string;
      slug: string;
      order: number;
      subsections: { id: string; title: string; slug: string; order: number }[];
    };
    const topics = (allTopicsResult.data ?? []) as unknown as TopicRow[];
    const topicIdx = topics.findIndex((t) => t.id === topic.id);
    if (topicIdx !== -1 && topicIdx < topics.length - 1) {
      const nextTopic = topics[topicIdx + 1];
      const firstSub = [...(nextTopic.subsections ?? [])].sort(
        (a, b) => a.order - b.order
      )[0];
      if (firstSub) {
        nextHref = `/learn/${nextTopic.slug}/${firstSub.slug}`;
        nextTitle = firstSub.title;
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <WalkthroughViewer
        subsectionId={subsection.id as string}
        subsectionTitle={subsection.title as string}
        steps={(subsection.walkthrough_steps ?? []) as WalkthroughStep[]}
        questions={questions}
        familyId={user?.id ?? ""}
        nextHref={nextHref}
        nextTitle={nextTitle}
      />
    </main>
  );
}
