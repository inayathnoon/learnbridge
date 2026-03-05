import { getBrowserClient } from "./client";

export async function createQuestionAttempt(params: {
  sessionId: string;
  questionId: string;
  levelAttempted: number;
  answerGiven: number;
  correct: boolean;
}): Promise<void> {
  const supabase = getBrowserClient();
  const { error } = await supabase.from("question_attempts").insert({
    session_id: params.sessionId,
    question_id: params.questionId,
    level_attempted: params.levelAttempted,
    answer_given: params.answerGiven,
    correct: params.correct,
  });

  if (error) throw error;
}
