"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { QuizQuestion } from "../types";
import {
  QuizStep,
  transition,
  stepToLevel,
  isExplanationStep,
  isQuestionStep,
} from "../quiz-state-machine";

export type { QuizStep };

type UseQuizEngineResult = {
  step: QuizStep;
  currentQuestion: QuizQuestion | null;
  lastAnsweredQuestion: QuizQuestion | null;
  isExplanation: boolean;
  answer: (correct: boolean) => void;
  advance: () => void;
};

function pickQuestion(
  questions: QuizQuestion[],
  level: number
): QuizQuestion | null {
  const pool = questions.filter((q) => q.level === level);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function useQuizEngine(questions: QuizQuestion[]): UseQuizEngineResult {
  const [step, setStep] = useState<QuizStep>("l3_initial");
  const [questionCache, setQuestionCache] = useState<
    Partial<Record<QuizStep, QuizQuestion>>
  >({});
  const [lastAnsweredQuestion, setLastAnsweredQuestion] =
    useState<QuizQuestion | null>(null);

  const currentLevel = stepToLevel(step);

  // Ref so the answer callback always captures the latest currentQuestion
  const currentQuestionRef = useRef<QuizQuestion | null>(null);

  const currentQuestion = useMemo(() => {
    if (!isQuestionStep(step) || currentLevel === null) return null;
    if (questionCache[step]) return questionCache[step]!;
    return pickQuestion(questions, currentLevel);
  }, [step, currentLevel, questionCache, questions]);

  // Keep ref in sync so answer() closure always sees the latest value
  currentQuestionRef.current = currentQuestion;

  const answer = useCallback(
    (correct: boolean) => {
      const event = correct ? "answer_correct" : "answer_wrong";
      setLastAnsweredQuestion(currentQuestionRef.current);
      setStep((current) => {
        const next = transition(current, event);
        const nextLevel = stepToLevel(next);
        if (isQuestionStep(next) && nextLevel !== null) {
          setQuestionCache((cache) => {
            if (cache[next]) return cache;
            const q = pickQuestion(questions, nextLevel);
            return q ? { ...cache, [next]: q } : cache;
          });
        }
        return next;
      });
    },
    [questions]
  );

  const advance = useCallback(() => {
    setStep((current) => {
      const next = transition(current, "advance");
      const nextLevel = stepToLevel(next);
      if (isQuestionStep(next) && nextLevel !== null) {
        setQuestionCache((cache) => {
          if (cache[next]) return cache;
          const q = pickQuestion(questions, nextLevel);
          return q ? { ...cache, [next]: q } : cache;
        });
      }
      return next;
    });
  }, [questions]);

  return {
    step,
    currentQuestion,
    lastAnsweredQuestion,
    isExplanation: isExplanationStep(step),
    answer,
    advance,
  };
}
