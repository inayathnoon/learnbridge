"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/features/learn/hooks/useSession";
import { useQuizEngine } from "@/features/learn/hooks/useQuizEngine";
import { QuizCard } from "./QuizCard";
import { QuizQuestion } from "../types";
import { createQuestionAttempt } from "@/lib/db/question-attempts";
import { stepToLevel } from "../quiz-state-machine";

type WalkthroughStep = {
  image_url?: string;
  caption: string;
};

type Props = {
  subsectionId: string;
  subsectionTitle: string;
  steps: WalkthroughStep[];
  questions: QuizQuestion[];
  familyId: string;
  nextHref: string | null;
  nextTitle: string | null;
};

export function WalkthroughViewer({
  subsectionId,
  subsectionTitle,
  steps,
  questions,
  familyId,
  nextHref,
  nextTitle,
}: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);

  const { sessionId, markCompleted, markStuck } = useSession(
    familyId,
    subsectionId
  );
  const {
    step: quizStep,
    currentQuestion,
    lastAnsweredQuestion,
    answer,
    advance,
  } = useQuizEngine(questions);

  // Sync terminal quiz states to session outcome (once)
  useEffect(() => {
    if (quizStep === "complete") {
      markCompleted().catch(() => {});
    }
    if (quizStep === "stuck") {
      markStuck().catch(() => {});
      if (sessionId) {
        fetch("/api/alerts/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, subsectionId }),
        }).catch(() => {});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizStep]);

  function handleAnswer(correct: boolean, selectedIndex: number) {
    // Persist attempt before advancing state
    if (sessionId && currentQuestion) {
      const level = stepToLevel(quizStep) ?? currentQuestion.level;
      createQuestionAttempt({
        sessionId,
        questionId: currentQuestion.id,
        levelAttempted: level,
        answerGiven: selectedIndex,
        correct,
      }).catch(() => {});
    }
    answer(correct);
  }

  const walkthroughStep = steps[currentStep];
  const isLastWalkthroughStep = currentStep === steps.length - 1;
  const totalSteps = steps.length;

  if (totalSteps === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-8">
        <h1 className="mb-4 text-2xl font-bold text-slate-800">
          {subsectionTitle}
        </h1>
        <p className="text-slate-500">No content available yet.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 pb-28 sm:p-8 sm:pb-28">
      <h1 className="mb-2 text-2xl font-bold text-slate-800">
        {subsectionTitle}
      </h1>

      {!quizStarted ? (
        <>
          <p className="mb-6 text-sm font-medium text-slate-500">
            Step {currentStep + 1} of {totalSteps}
          </p>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <img
              src={walkthroughStep.image_url ?? "/images/placeholder.svg"}
              alt={`Step ${currentStep + 1}`}
              className="w-full object-contain bg-slate-100"
              style={{ maxHeight: "260px" }}
            />
            <div className="p-6">
              <p className="text-lg leading-relaxed text-slate-700">
                {walkthroughStep.caption}
              </p>
            </div>
          </div>

          {/* Sticky next button */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-8">
            <div className="mx-auto flex max-w-2xl justify-end">
              {!isLastWalkthroughStep ? (
                <button
                  onClick={() => setCurrentStep((s) => s + 1)}
                  className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 active:bg-blue-800"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setQuizStarted(true)}
                  className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700 active:bg-green-800"
                >
                  Start Quiz →
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6">
          <QuizCard
            step={quizStep}
            question={currentQuestion}
            onAnswer={handleAnswer}
            onAdvance={advance}
            explanationText={lastAnsweredQuestion?.explanation}
            conceptImageUrl={steps[0]?.image_url}
            nextHref={nextHref}
            nextTitle={nextTitle}
          />
        </div>
      )}
    </div>
  );
}
