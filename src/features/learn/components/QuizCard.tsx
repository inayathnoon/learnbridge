"use client";

import { QuizQuestion } from "../types";
import { QuizStep } from "../hooks/useQuizEngine";

type Props = {
  step: QuizStep;
  question: QuizQuestion | null;
  onAnswer: (correct: boolean, selectedIndex: number) => void;
  onAdvance: () => void;
  explanationText?: string;
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
  nextHref,
  nextTitle,
}: Props) {
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
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 sm:p-8">
        <h2 className="mb-4 text-xl font-bold text-blue-700">
          Let&apos;s review
        </h2>
        <p className="mb-6 text-blue-800">
          {explanationText ?? "Let's look at this again carefully."}
        </p>
        <button
          onClick={onAdvance}
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 active:bg-blue-800"
        >
          Try again
        </button>
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {LEVEL_LABEL[question.level] ?? `Level ${question.level}`}
      </p>

      <p className="mb-6 text-lg font-medium text-slate-800">
        {question.prompt}
      </p>

      <div className="flex flex-col gap-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onAnswer(i === question.correctIndex, i)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-left text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
