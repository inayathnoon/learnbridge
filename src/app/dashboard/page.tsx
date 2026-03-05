import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SessionsTable } from "@/features/dashboard/components/SessionsTable";
import { ScoresSummary } from "@/features/dashboard/components/ScoresSummary";
import { AlertsList } from "@/features/dashboard/components/AlertsList";

export default async function DashboardPage() {
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

  const [sessionsResult, attemptsResult, alertsResult] = await Promise.all([
    supabase
      .from("sessions")
      .select("subsection_id, outcome, subsections(title)")
      .eq("family_id", user.id)
      .order("started_at", { ascending: false }),
    supabase
      .from("question_attempts")
      .select("correct, session_id")
      .in(
        "session_id",
        (
          await supabase
            .from("sessions")
            .select("id")
            .eq("family_id", user.id)
        ).data?.map((s) => s.id) ?? []
      ),
    supabase
      .from("alerts_sent")
      .select("sent_at, subsection_id, subsections(title)")
      .eq("family_id", user.id)
      .order("sent_at", { ascending: false }),
  ]);

  // Build sessions table: group by subsection
  const sessionsBySubsection = new Map<
    string,
    { title: string; count: number; lastOutcome: string | null }
  >();

  for (const s of sessionsResult.data ?? []) {
    const sub = s.subsections as unknown as { title: string } | null;
    if (!sub) continue;
    const id = s.subsection_id as string;
    const existing = sessionsBySubsection.get(id);
    if (!existing) {
      sessionsBySubsection.set(id, {
        title: sub.title,
        count: 1,
        lastOutcome: s.outcome as string | null,
      });
    } else {
      existing.count++;
    }
  }

  const sessionRows = Array.from(sessionsBySubsection.values()).map((v) => ({
    subsectionTitle: v.title,
    completedCount: v.count,
    lastOutcome: v.lastOutcome,
  }));

  // Simple correct/total counts (topic-level breakdown would need another query)
  const attempts = attemptsResult.data ?? [];
  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.correct).length;

  const topicScores =
    totalAttempts > 0
      ? [
          {
            topicTitle: "All Topics",
            correctCount: correctAttempts,
            totalCount: totalAttempts,
          },
        ]
      : [];

  // Alerts list
  const alertRows = (alertsResult.data ?? []).map((a) => ({
    sentAt: a.sent_at as string,
    subsectionTitle:
      (a.subsections as unknown as { title: string } | null)?.title ??
      "Unknown",
  }));

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-800">Progress</h1>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Sessions
        </h2>
        <SessionsTable rows={sessionRows} />
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Quiz Scores
        </h2>
        <ScoresSummary scores={topicScores} />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Parent Alerts Sent
        </h2>
        <AlertsList alerts={alertRows} />
      </section>
    </main>
  );
}
