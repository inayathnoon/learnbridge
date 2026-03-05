import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  SubsectionCard,
  type SubsectionStatus,
} from "@/features/learn/components/SubsectionCard";
import { getLastVisitedSubsection } from "@/lib/db/sessions";

type Subsection = {
  id: string;
  title: string;
  slug: string;
  order: number;
};

type Topic = {
  id: string;
  title: string;
  slug: string;
  order: number;
  subsections: Subsection[];
};

export default async function LearnIndexPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [topicsResult, sessionsResult, lastVisited] = await Promise.all([
    supabase
      .from("topics")
      .select("id, title, slug, order, subsections(id, title, slug, order)")
      .order("order", { ascending: true }),
    supabase
      .from("sessions")
      .select("subsection_id, outcome")
      .eq("family_id", user.id),
    getLastVisitedSubsection(user.id),
  ]);

  const topics = (topicsResult.data ?? []) as unknown as Topic[];

  // Build progress map: subsection_id → status
  const progressMap = new Map<string, SubsectionStatus>();
  for (const session of sessionsResult.data ?? []) {
    const id = session.subsection_id as string;
    const outcome = session.outcome as string | null;
    const current = progressMap.get(id);
    if (outcome === "completed") {
      progressMap.set(id, "completed");
    } else if (!current) {
      progressMap.set(id, "in_progress");
    }
  }

  const continueUrl = lastVisited
    ? `/learn/${lastVisited.topic_slug}/${lastVisited.subsection_slug}`
    : null;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">Learn</h1>

      {continueUrl && (
        <a
          href={continueUrl}
          className="mb-8 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          <span>▶</span>
          <span>Continue where you left off</span>
        </a>
      )}

      {topics.length === 0 ? (
        <p className="text-slate-500">No content available yet.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {topics.map((topic) => (
            <section key={topic.id}>
              <h2 className="mb-3 text-base font-semibold uppercase tracking-wide text-slate-500">
                {topic.title}
              </h2>
              <div className="flex flex-col gap-2">
                {[...topic.subsections]
                  .sort((a, b) => a.order - b.order)
                  .map((sub) => (
                    <SubsectionCard
                      key={sub.id}
                      title={sub.title}
                      topicSlug={topic.slug}
                      subsectionSlug={sub.slug}
                      status={progressMap.get(sub.id) ?? "not_started"}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
