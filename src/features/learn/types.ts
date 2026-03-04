export type Topic = {
  id: string;
  slug: string;
  title: string;
  subsections: Subsection[];
};

export type Subsection = {
  id: string;
  slug: string;
  title: string;
  topicId: string;
};

export type WalkthroughStep = {
  id: string;
  subsectionId: string;
  order: number;
  content: string;
  imageUrl?: string;
};

export type QuizQuestion = {
  id: string;
  subsectionId: string;
  level: 1 | 2 | 3 | 4 | 5;
  prompt: string;
  options: string[];
  correctIndex: number;
};

export type QuizLevel = 1 | 2 | 3 | 4 | 5;

export type QuizState =
  | { status: "idle" }
  | { status: "active"; level: QuizLevel; attempts: number }
  | { status: "passed" }
  | { status: "stuck" };
