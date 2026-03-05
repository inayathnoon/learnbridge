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
    supabase.from("topics").select("id").eq("slug", topicSlug).single(),
  ]);

  const user = authResult.data.user;
  const topic = topicResult.data;

  if (!topic) notFound();

  const { data: subsection } = await supabase
    .from("subsections")
    .select("id, title, walkthrough_steps")
    .eq("slug", subsectionSlug)
    .eq("topic_id", topic.id)
    .single();

  if (!subsection) notFound();

  const { data: questionsData } = await supabase
    .from("questions")
    .select("id, level, prompt, options, correct_index, explanation")
    .eq("subsection_id", subsection.id)
    .order("level");

  const questions: QuizQuestion[] = (questionsData ?? []).map((q) => ({
    id: q.id as string,
    subsectionId: subsection.id as string,
    level: q.level as QuizQuestion["level"],
    prompt: q.prompt as string,
    options: q.options as string[],
    correctIndex: q.correct_index as number,
    explanation: q.explanation as string | undefined,
  }));

  return (
    <main className="min-h-screen bg-slate-50">
      <WalkthroughViewer
        subsectionId={subsection.id as string}
        subsectionTitle={subsection.title as string}
        steps={(subsection.walkthrough_steps ?? []) as WalkthroughStep[]}
        questions={questions}
        familyId={user?.id ?? ""}
      />
    </main>
  );
}
