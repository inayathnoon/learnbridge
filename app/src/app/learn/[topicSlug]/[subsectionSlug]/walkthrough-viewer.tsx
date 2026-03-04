"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Step = { image_url: string; caption: string };
type Question = {
  id: string;
  level: number;
  content: string;
  options: string[];
  correct_answer: string;
  explanation: string;
};

type Subsection = {
  id: string;
  title: string;
  slug: string;
  walkthrough_steps: Step[];
  coaching_guide: string;
  topics: { title: string; slug: string }[] | null;
};

// Quiz state machine states
type QuizPhase =
  | "walkthrough"
  | "quiz_l3"
  | "quiz_l4"
  | "quiz_l4_retry"
  | "show_l1"
  | "show_l2"
  | "explain_l3"
  | "quiz_l3_retry"
  | "completed"
  | "stuck";

export default function WalkthroughViewer({
  subsection,
  questions,
  familyId,
}: {
  subsection: Subsection;
  questions: Question[];
  familyId: string;
}) {
  const steps = subsection.walkthrough_steps ?? [];
  const [stepIndex, setStepIndex] = useState(0);
  const [phase, setPhase] = useState<QuizPhase>("walkthrough");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const supabase = createClient();

  const getQuestion = (level: number) =>
    questions.find((q) => q.level === level);

  async function createSession() {
    const { data } = await supabase
      .from("sessions")
      .insert({
        family_id: familyId,
        subsection_id: subsection.id,
      })
      .select("id")
      .single();
    if (data) setSessionId(data.id);
    return data?.id;
  }

  async function recordAttempt(
    sid: string,
    question: Question,
    answer: string,
    correct: boolean
  ) {
    await supabase.from("question_attempts").insert({
      session_id: sid,
      question_id: question.id,
      level_attempted: question.level,
      answer_given: answer,
      correct,
    });
  }

  async function completeSession(sid: string, outcome: "completed" | "stuck") {
    await supabase
      .from("sessions")
      .update({ completed_at: new Date().toISOString(), outcome })
      .eq("id", sid);

    if (outcome === "stuck") {
      await fetch("/api/alerts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          familyId,
          sessionId: sid,
          subsectionId: subsection.id,
        }),
      });
    }
  }

  async function handleStartQuiz() {
    const sid = await createSession();
    if (sid) {
      setSessionId(sid);
      setPhase("quiz_l3");
    }
  }

  async function handleAnswer(question: Question, answer: string) {
    setSelectedAnswer(answer);
    const correct = answer === question.correct_answer;
    const sid = sessionId!;

    await recordAttempt(sid, question, answer, correct);

    if (!correct) {
      setShowExplanation(true);
      return;
    }

    // Correct answer — advance based on phase
    setShowExplanation(false);
    setSelectedAnswer(null);

    switch (phase) {
      case "quiz_l3":
        setPhase("quiz_l4");
        break;
      case "quiz_l4":
      case "quiz_l4_retry":
        await completeSession(sid, "completed");
        setPhase("completed");
        break;
      case "quiz_l3_retry":
        setPhase("quiz_l4");
        break;
    }
  }

  function handleWrongContinue() {
    setShowExplanation(false);
    setSelectedAnswer(null);

    // State machine transitions on wrong answer
    switch (phase) {
      case "quiz_l3":
        // L3 fail → show L1, L2, explain L3, retry L3
        setPhase("show_l1");
        break;
      case "quiz_l4":
        // L4 fail → explain + retry L4
        setPhase("quiz_l4_retry");
        break;
      case "quiz_l4_retry":
        // L4 retry fail → STUCK
        completeSession(sessionId!, "stuck");
        setPhase("stuck");
        break;
      case "quiz_l3_retry":
        // L3 retry fail → STUCK
        completeSession(sessionId!, "stuck");
        setPhase("stuck");
        break;
    }
  }

  // Walkthrough phase
  if (phase === "walkthrough") {
    const step = steps[stepIndex];
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Link
          href="/learn"
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to topics
        </Link>
        <h1 className="text-2xl font-bold mb-2">{subsection.title}</h1>
        <p className="text-sm text-gray-500 mb-6">
          Step {stepIndex + 1} of {steps.length}
        </p>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="bg-gray-100 rounded-md h-48 flex items-center justify-center mb-4">
            <span className="text-gray-400 text-sm">Illustration</span>
          </div>
          <p className="text-lg">{step?.caption}</p>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setStepIndex((i) => i - 1)}
            disabled={stepIndex === 0}
            className="px-4 py-2 rounded-md border border-gray-300 disabled:opacity-30"
          >
            Previous
          </button>
          {stepIndex < steps.length - 1 ? (
            <button
              onClick={() => setStepIndex((i) => i + 1)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleStartQuiz}
              className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium"
            >
              Start Quiz
            </button>
          )}
        </div>
      </div>
    );
  }

  // Show L1/L2 review phases
  if (phase === "show_l1" || phase === "show_l2") {
    const level = phase === "show_l1" ? 1 : 2;
    const question = getQuestion(level);
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-2">{subsection.title}</h1>
        <p className="text-sm text-yellow-600 font-medium mb-6">
          Let&apos;s review — Level {level}
        </p>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-lg mb-4">{question?.content}</p>
          <p className="text-gray-600 mb-4">
            Answer: <strong>{question?.correct_answer}</strong>
          </p>
          <p className="text-gray-500 text-sm">{question?.explanation}</p>
        </div>
        <button
          onClick={() =>
            setPhase(phase === "show_l1" ? "show_l2" : "explain_l3")
          }
          className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    );
  }

  // Explain L3 before retry
  if (phase === "explain_l3") {
    const question = getQuestion(3);
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-2">{subsection.title}</h1>
        <p className="text-sm text-yellow-600 font-medium mb-6">
          Let&apos;s look at this again
        </p>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-lg mb-4">{question?.content}</p>
          <p className="text-gray-500 text-sm">{question?.explanation}</p>
        </div>
        <button
          onClick={() => setPhase("quiz_l3_retry")}
          className="px-6 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Completed
  if (phase === "completed") {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-green-600">
          Great job!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          You completed {subsection.title}!
        </p>
        <Link
          href="/learn"
          className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 inline-block"
        >
          Back to topics
        </Link>
      </div>
    );
  }

  // Stuck
  if (phase === "stuck") {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">
          It&apos;s okay — this is tricky!
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          We&apos;ve sent a message to your parent to help you with this topic.
        </p>
        <p className="text-gray-500 mb-8">
          Take a break and come back when your parent can help you through it.
        </p>
        <Link
          href="/learn"
          className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 inline-block"
        >
          Back to topics
        </Link>
      </div>
    );
  }

  // Quiz phases (L3, L4, L3 retry, L4 retry)
  const levelMap: Record<string, number> = {
    quiz_l3: 3,
    quiz_l4: 4,
    quiz_l3_retry: 3,
    quiz_l4_retry: 4,
  };
  const level = levelMap[phase] ?? 3;
  const question = getQuestion(level);
  const isRetry = phase.includes("retry");

  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">{subsection.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Level {level} {isRetry && "(retry)"}
      </p>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-lg mb-6">{question.content}</p>

        <div className="space-y-3">
          {question.options.map((opt: string) => (
            <button
              key={opt}
              onClick={() => handleAnswer(question, opt)}
              disabled={selectedAnswer !== null}
              className={`w-full text-left px-4 py-3 rounded-md border transition-colors ${
                selectedAnswer === opt
                  ? opt === question.correct_answer
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              } disabled:cursor-default`}
            >
              {opt}
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="font-medium text-yellow-800 mb-1">Not quite!</p>
            <p className="text-yellow-700 text-sm">{question.explanation}</p>
            <button
              onClick={handleWrongContinue}
              className="mt-3 px-4 py-2 rounded-md bg-yellow-600 text-white hover:bg-yellow-700 text-sm"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
