type SessionRow = {
  subsectionTitle: string;
  completedCount: number;
  lastOutcome: string | null;
};

type Props = {
  rows: SessionRow[];
};

export function SessionsTable({ rows }: Props) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">No sessions yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="pb-2 pr-4">Subsection</th>
            <th className="pb-2 pr-4">Sessions</th>
            <th className="pb-2">Last Outcome</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              <td className="py-3 pr-4 font-medium text-slate-800">
                {row.subsectionTitle}
              </td>
              <td className="py-3 pr-4 text-slate-600">{row.completedCount}</td>
              <td className="py-3">
                {row.lastOutcome ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      row.lastOutcome === "completed"
                        ? "bg-green-100 text-green-700"
                        : row.lastOutcome === "stuck"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {row.lastOutcome}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
