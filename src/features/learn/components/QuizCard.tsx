"use client";

import { useState, useEffect } from "react";
import { QuizQuestion } from "../types";
import { QuizStep } from "../hooks/useQuizEngine";

type Props = {
  step: QuizStep;
  question: QuizQuestion | null;
  onAnswer: (correct: boolean, selectedIndex: number) => void;
  onAdvance: () => void;
  explanationText?: string;
  conceptImageUrl?: string;
  nextHref?: string | null;
  nextTitle?: string | null;
};

const LEVEL_LABEL: Record<number, string> = {
  1: "Warm-up",
  2: "Getting there",
  3: "Challenge",
  4: "Level up",
};

export function QuizCard({
  step,
  question,
  onAnswer,
  onAdvance,
  explanationText,
  conceptImageUrl,
  nextHref,
  nextTitle,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    setSelectedIndex(null);
    setHasAnswered(false);
  }, [question?.id]);

  if (step === "complete") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 sm:p-8 text-center">
        <div className="mb-1 text-4xl">🎉</div>
        <h2 className="mb-2 text-2xl font-bold text-green-700">Great work!</h2>
        <p className="mb-6 text-green-600">You&apos;ve completed this section.</p>
        {nextHref && nextTitle ? (
          <a
            href={nextHref}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 active:bg-green-800"
          >
            <span>Next: {nextTitle}</span>
            <span>→</span>
          </a>
        ) : (
          <a
            href="/learn"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 active:bg-green-800"
          >
            <span>Back to all lessons</span>
            <span>→</span>
          </a>
        )}
      </div>
    );
  }

  if (step === "stuck") {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 sm:p-8 text-center">
        <h2 className="mb-2 text-xl font-bold text-orange-700">
          That&apos;s a tricky one!
        </h2>
        <p className="text-orange-600">
          We&apos;ve let your parent know. They&apos;ll help you with this one.
        </p>
      </div>
    );
  }

  if (step === "l3_explain" || step === "l4_explain") {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
        {/* Illustration */}
        {conceptImageUrl && (
          <img
            src={conceptImageUrl}
            alt="Concept illustration"
            className="w-full object-contain bg-blue-100"
            style={{ maxHeight: "220px" }}
          />
        )}
        <div className="p-5 sm:p-8">
          <h2 className="mb-3 text-xl font-bold text-blue-700">
            Let&apos;s review
          </h2>
          <p className="mb-6 text-blue-800 leading-relaxed">
            {explanationText ?? "Let's look at this again carefully."}
          </p>
          <button
            onClick={onAdvance}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 active:bg-blue-800"
          >
            Try again →
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <p className="text-slate-500">Loading question…</p>
      </div>
    );
  }

  function handleOptionClick(i: number) {
    if (hasAnswered) return;
    setSelectedIndex(i);
    setHasAnswered(true);
  }

  function handleConfirm() {
    if (selectedIndex === null || !question) return;
    const correct = selectedIndex === question.correctIndex;
    onAnswer(correct, selectedIndex);
    setSelectedIndex(null);
    setHasAnswered(false);
  }

  const isCorrect = selectedIndex !== null && selectedIndex === question.correctIndex;

  // Options column — shared between both states
  const optionsColumn = (
    <div className="flex flex-col gap-3">
      {question.options.map((option, i) => {
        let cls =
          "rounded-lg border px-4 py-3 text-left font-medium transition-colors flex items-center gap-2";

        if (!hasAnswered) {
          cls +=
            " border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 cursor-pointer";
        } else if (i === question.correctIndex) {
          cls += " border-green-400 bg-green-50 text-green-800";
        } else if (i === selectedIndex) {
          cls += " border-red-400 bg-red-50 text-red-800";
        } else {
          cls += " border-slate-100 bg-slate-50 text-slate-400 cursor-default";
        }

        return (
          <button
            key={i}
            onClick={() => handleOptionClick(i)}
            disabled={hasAnswered}
            className={cls}
          >
            {hasAnswered && i === question.correctIndex && (
              <span className="shrink-0 text-green-600 font-bold">✓</span>
            )}
            {hasAnswered && i === selectedIndex && i !== question.correctIndex && (
              <span className="shrink-0 text-red-500 font-bold">✗</span>
            )}
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Question header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-100">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {LEVEL_LABEL[question.level] ?? `Level ${question.level}`}
        </p>
        <p className="text-lg font-medium text-slate-800">{question.prompt}</p>
      </div>

      {/* Body: options only (pre-answer) or LHS options | RHS feedback (post-answer) */}
      {!hasAnswered ? (
        <div className="p-6">{optionsColumn}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* LHS — options with colour feedback */}
          <div className="p-6">{optionsColumn}</div>

          {/* RHS — result + explanation + action */}
          <div className="p-6 flex flex-col justify-between gap-4">
            <div>
              <p
                className={`mb-3 text-sm font-semibold uppercase tracking-wide ${
                  isCorrect ? "text-green-600" : "text-red-500"
                }`}
              >
                {isCorrect ? "Correct!" : "Not quite"}
              </p>
              {question.explanation ? (
                <p className="text-sm leading-relaxed text-slate-600">
                  {question.explanation}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  {isCorrect
                    ? "Nice work — keep going!"
                    : `The correct answer is: ${question.options[question.correctIndex]}`}
                </p>
              )}
            </div>

            <button
              onClick={handleConfirm}
              className={`self-start rounded-lg px-6 py-3 font-semibold text-white ${
                isCorrect
                  ? "bg-green-600 hover:bg-green-700 active:bg-green-800"
                  : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
              }`}
            >
              {isCorrect ? "Continue →" : "Got it →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
