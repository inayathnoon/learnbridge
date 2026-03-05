type AlertRow = {
  sentAt: string;
  subsectionTitle: string;
};

type Props = {
  alerts: AlertRow[];
};

export function AlertsList({ alerts }: Props) {
  if (alerts.length === 0) {
    return (
      <p className="text-sm text-slate-500">No alerts sent yet — great progress!</p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {alerts.map((alert, i) => (
        <li
          key={i}
          className="flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm"
        >
          <span className="font-medium text-orange-800">
            {alert.subsectionTitle}
          </span>
          <span className="text-orange-500">
            {new Date(alert.sentAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </li>
      ))}
    </ul>
  );
}
