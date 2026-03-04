export type ProgressRecord = {
  userId: string;
  subsectionId: string;
  status: "not_started" | "in_progress" | "passed" | "stuck";
  updatedAt: string;
};

export type DashboardData = {
  child: {
    id: string;
    name: string;
  };
  progress: ProgressRecord[];
};
