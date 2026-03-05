"use client";

import { useEffect, useRef, useState } from "react";
import {
  createSession,
  updateSessionOutcome,
  type SessionOutcome,
} from "@/lib/db/sessions";

type UseSessionResult = {
  sessionId: string | null;
  markCompleted: () => Promise<void>;
  markStuck: () => Promise<void>;
  markAbandoned: () => Promise<void>;
  error: string | null;
};

export function useSession(
  familyId: string,
  subsectionId: string
): UseSessionResult {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const markedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    createSession(familyId, subsectionId)
      .then((session) => {
        if (!cancelled) setSessionId(session.id);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to create session");
      });

    return () => {
      cancelled = true;
      // Mark abandoned on unmount if outcome not already set
      if (sessionId && !markedRef.current) {
        markedRef.current = true;
        updateSessionOutcome(sessionId, "abandoned").catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId, subsectionId]);

  async function markOutcome(outcome: SessionOutcome) {
    if (!sessionId || markedRef.current) return;
    markedRef.current = true;
    await updateSessionOutcome(sessionId, outcome);
  }

  return {
    sessionId,
    markCompleted: () => markOutcome("completed"),
    markStuck: () => markOutcome("stuck"),
    markAbandoned: () => markOutcome("abandoned"),
    error,
  };
}
