// Utilities for the learn feature — pure functions, no side effects

export function getNextLevel(
  current: number,
  correct: boolean
): number | null {
  if (correct && current >= 5) return null; // passed
  if (correct) return current + 1;
  if (!correct && current <= 1) return null; // stuck
  return current - 1;
}
