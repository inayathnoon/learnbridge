type TopicScore = {
  topicTitle: string;
  correctCount: number;
  totalCount: number;
};

type Props = {
  scores: TopicScore[];
};

export function ScoresSummary({ scores }: Props) {
  if (scores.length === 0) {
    return <p className="text-sm text-slate-500">No quiz attempts yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {scores.map((s, i) => {
        const pct = s.totalCount > 0 ? Math.round((s.correctCount / s.totalCount) * 100) : 0;
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{s.topicTitle}</span>
              <span className="text-slate-500">
                {s.correctCount}/{s.totalCount} correct ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
