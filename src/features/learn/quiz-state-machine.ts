export type QuizStep =
  | "l3_initial"
  | "l1"
  | "l2"
  | "l3_explain"
  | "l3_retry"
  | "l4"
  | "l4_explain"
  | "l4_retry"
  | "complete"
  | "stuck";

export type QuizEvent = "answer_correct" | "answer_wrong" | "advance";

export function transition(step: QuizStep, event: QuizEvent): QuizStep {
  switch (step) {
    case "l3_initial":
      if (event === "answer_correct") return "l4";
      if (event === "answer_wrong") return "l1";
      return step;
    case "l1":
      if (event === "answer_correct" || event === "answer_wrong") return "l2";
      return step;
    case "l2":
      if (event === "answer_correct" || event === "answer_wrong")
        return "l3_explain";
      return step;
    case "l3_explain":
      if (event === "advance") return "l3_retry";
      return step;
    case "l3_retry":
      if (event === "answer_correct") return "l4";
      if (event === "answer_wrong") return "stuck";
      return step;
    case "l4":
      if (event === "answer_correct") return "complete";
      if (event === "answer_wrong") return "l4_explain";
      return step;
    case "l4_explain":
      if (event === "advance") return "l4_retry";
      return step;
    case "l4_retry":
      if (event === "answer_correct") return "complete";
      if (event === "answer_wrong") return "stuck";
      return step;
    case "complete":
    case "stuck":
      return step;
  }
}

export type QuizLevel = 1 | 2 | 3 | 4;

export function stepToLevel(step: QuizStep): QuizLevel | null {
  const map: Partial<Record<QuizStep, QuizLevel>> = {
    l3_initial: 3,
    l1: 1,
    l2: 2,
    l3_retry: 3,
    l4: 4,
    l4_retry: 4,
  };
  return map[step] ?? null;
}

export function isTerminal(step: QuizStep): boolean {
  return step === "complete" || step === "stuck";
}

export function isExplanationStep(step: QuizStep): boolean {
  return step === "l3_explain" || step === "l4_explain";
}

export function isQuestionStep(step: QuizStep): boolean {
  return stepToLevel(step) !== null;
}
