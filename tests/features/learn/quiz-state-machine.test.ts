import { describe, it, expect } from "vitest";
import {
  transition,
  stepToLevel,
  isTerminal,
  isExplanationStep,
  isQuestionStep,
  type QuizStep,
} from "@/features/learn/quiz-state-machine";

describe("quiz state machine — transition", () => {
  // Path 1: L3 pass → L4 pass = COMPLETE
  it("path 1: L3 pass → L4 pass = complete", () => {
    let step: QuizStep = "l3_initial";
    step = transition(step, "answer_correct");
    expect(step).toBe("l4");
    step = transition(step, "answer_correct");
    expect(step).toBe("complete");
  });

  // Path 2: L3 pass → L4 fail → explain → retry L4 pass = COMPLETE
  it("path 2: L3 pass → L4 fail → explain → retry L4 pass = complete", () => {
    let step: QuizStep = "l3_initial";
    step = transition(step, "answer_correct"); // L3 pass
    expect(step).toBe("l4");
    step = transition(step, "answer_wrong"); // L4 fail
    expect(step).toBe("l4_explain");
    step = transition(step, "advance"); // see explanation
    expect(step).toBe("l4_retry");
    step = transition(step, "answer_correct"); // L4 retry pass
    expect(step).toBe("complete");
  });

  // Path 3: L3 pass → L4 fail → explain → retry L4 fail = STUCK
  it("path 3: L3 pass → L4 fail → explain → retry L4 fail = stuck", () => {
    let step: QuizStep = "l3_initial";
    step = transition(step, "answer_correct"); // L3 pass
    step = transition(step, "answer_wrong"); // L4 fail
    step = transition(step, "advance"); // explanation
    step = transition(step, "answer_wrong"); // L4 retry fail
    expect(step).toBe("stuck");
  });

  // Path 4: L3 fail → L1 → L2 → explain L3 → retry L3 pass → L4 pass = COMPLETE
  it("path 4: L3 fail fallback then L3 retry pass → L4 pass = complete", () => {
    let step: QuizStep = "l3_initial";
    step = transition(step, "answer_wrong"); // L3 fail
    expect(step).toBe("l1");
    step = transition(step, "answer_wrong"); // L1 (advances regardless)
    expect(step).toBe("l2");
    step = transition(step, "answer_correct"); // L2 (advances regardless)
    expect(step).toBe("l3_explain");
    step = transition(step, "advance"); // see L3 explanation
    expect(step).toBe("l3_retry");
    step = transition(step, "answer_correct"); // L3 retry pass
    expect(step).toBe("l4");
    step = transition(step, "answer_correct"); // L4 pass
    expect(step).toBe("complete");
  });

  // Path 5: L3 fail → fallback → L3 retry fail = STUCK
  it("path 5: L3 fail fallback → retry L3 fail = stuck", () => {
    let step: QuizStep = "l3_initial";
    step = transition(step, "answer_wrong"); // L3 fail
    step = transition(step, "answer_correct"); // L1 (always advances)
    step = transition(step, "answer_correct"); // L2 (always advances)
    step = transition(step, "advance"); // L3 explanation
    step = transition(step, "answer_wrong"); // L3 retry fail
    expect(step).toBe("stuck");
  });

  // L1 advances regardless of correct/wrong
  it("L1 advances on correct answer", () => {
    const step = transition("l1", "answer_correct");
    expect(step).toBe("l2");
  });

  it("L1 advances on wrong answer", () => {
    const step = transition("l1", "answer_wrong");
    expect(step).toBe("l2");
  });

  // Terminal states don't transition
  it("complete is terminal", () => {
    expect(transition("complete", "answer_correct")).toBe("complete");
    expect(transition("complete", "answer_wrong")).toBe("complete");
    expect(transition("complete", "advance")).toBe("complete");
  });

  it("stuck is terminal", () => {
    expect(transition("stuck", "answer_correct")).toBe("stuck");
    expect(transition("stuck", "answer_wrong")).toBe("stuck");
    expect(transition("stuck", "advance")).toBe("stuck");
  });
});

describe("stepToLevel", () => {
  it("returns correct level for question steps", () => {
    expect(stepToLevel("l3_initial")).toBe(3);
    expect(stepToLevel("l1")).toBe(1);
    expect(stepToLevel("l2")).toBe(2);
    expect(stepToLevel("l3_retry")).toBe(3);
    expect(stepToLevel("l4")).toBe(4);
    expect(stepToLevel("l4_retry")).toBe(4);
  });

  it("returns null for non-question steps", () => {
    expect(stepToLevel("l3_explain")).toBeNull();
    expect(stepToLevel("l4_explain")).toBeNull();
    expect(stepToLevel("complete")).toBeNull();
    expect(stepToLevel("stuck")).toBeNull();
  });
});

describe("step classification helpers", () => {
  it("isTerminal", () => {
    expect(isTerminal("complete")).toBe(true);
    expect(isTerminal("stuck")).toBe(true);
    expect(isTerminal("l3_initial")).toBe(false);
    expect(isTerminal("l4")).toBe(false);
  });

  it("isExplanationStep", () => {
    expect(isExplanationStep("l3_explain")).toBe(true);
    expect(isExplanationStep("l4_explain")).toBe(true);
    expect(isExplanationStep("l3_initial")).toBe(false);
    expect(isExplanationStep("complete")).toBe(false);
  });

  it("isQuestionStep", () => {
    expect(isQuestionStep("l3_initial")).toBe(true);
    expect(isQuestionStep("l1")).toBe(true);
    expect(isQuestionStep("l4_retry")).toBe(true);
    expect(isQuestionStep("l3_explain")).toBe(false);
    expect(isQuestionStep("complete")).toBe(false);
    expect(isQuestionStep("stuck")).toBe(false);
  });
});
