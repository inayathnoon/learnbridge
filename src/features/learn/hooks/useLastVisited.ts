"use client";

import { useEffect, useState } from "react";
import { getLastVisitedSubsection } from "@/lib/db/sessions";

type LastVisited = {
  topic_slug: string;
  subsection_slug: string;
} | null;

type UseLastVisitedResult = {
  lastVisited: LastVisited;
  loading: boolean;
};

export function useLastVisited(familyId: string): UseLastVisitedResult {
  const [lastVisited, setLastVisited] = useState<LastVisited>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLastVisitedSubsection(familyId)
      .then(setLastVisited)
      .catch(() => setLastVisited(null))
      .finally(() => setLoading(false));
  }, [familyId]);

  return { lastVisited, loading };
}
