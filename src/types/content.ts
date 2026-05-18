export interface Question {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  topicTag?: string;
}

export interface Topic {
  id: string;
  name: string;
  lessonId?: string;
  /** Credit for the source material this topic adapts from. Rendered as a
   *  quiet footer on the topic page. */
  attribution?: string;
  questions: Question[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  description: string;
  courses: Course[];
}

export interface QuizzesData {
  subjects: Subject[];
}

export interface AnswerRecord {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

export interface QuizAttempt {
  topicId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  answers: AnswerRecord[];
}

/** Per-question spaced-repetition state (SM-2 with a binary-quality mapping). */
export interface QuestionStats {
  questionId: string;
  topicId: string;
  ease: number;             // SM-2 ease factor; starts at 2.5, floored at 1.3
  repetitions: number;      // consecutive correct answers
  intervalDays: number;     // days until next due
  nextDueAt: number;        // unix ms timestamp
  totalSeen: number;
  totalCorrect: number;
  lastSeenAt: number;
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  course: string;
  estimatedMinutes: number;
  body: string;
}
