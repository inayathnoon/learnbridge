import Link from "next/link";

export type SubsectionStatus = "not_started" | "in_progress" | "completed";

type Props = {
  title: string;
  topicSlug: string;
  subsectionSlug: string;
  status: SubsectionStatus;
};

const STATUS_LABEL: Record<SubsectionStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_STYLE: Record<SubsectionStatus, string> = {
  not_started: "bg-slate-100 text-slate-500",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

export function SubsectionCard({
  title,
  topicSlug,
  subsectionSlug,
  status,
}: Props) {
  return (
    <Link
      href={`/learn/${topicSlug}/${subsectionSlug}`}
      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm hover:border-slate-300 hover:shadow transition-shadow"
    >
      <span className="text-sm font-medium text-slate-800">{title}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[status]}`}
      >
        {STATUS_LABEL[status]}
      </span>
    </Link>
  );
}
