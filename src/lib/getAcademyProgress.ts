import { learningQuestions } from "@/data";
import type {
  LearningCategory,
  LearningQuestion,
} from "@/data/types";
import {
  getQuestionProgress,
  loadLearningProgress,
  type LearningProgressState,
  type LearningStatus,
} from "@/lib/learningProgress";

export interface SubjectProgress {
  category: LearningCategory;
  totalQuestions: number;
  learnedQuestions: number;
  unseenQuestions: number;
  percent: number;
  statusCounts: Record<LearningStatus, number>;
}

export interface AcademyProgress {
  totalQuestions: number;
  learnedQuestions: number;
  unseenQuestions: number;
  percent: number;
  subjects: SubjectProgress[];
}

const CATEGORIES: LearningCategory[] = [
  "Umsatzsteuer",
  "Abgabenordnung",
  "Einkommensteuer",
  "Gewerbesteuer",
  "Erbschaftsteuer",
  "NPO und Gemeinnützigkeit",
];

function calculateSubjectProgress(
  category: LearningCategory,
  questions: LearningQuestion[],
  state: LearningProgressState,
): SubjectProgress {
  const categoryQuestions = questions.filter(
    (question) => question.category === category,
  );

  const progressEntries = categoryQuestions.map(
    (question) =>
      getQuestionProgress(question.id, state),
  );

  const learnedQuestions = progressEntries.filter(
    (progress) => progress.attempts > 0,
  ).length;

  const totalQuestions = categoryQuestions.length;
  const unseenQuestions =
    totalQuestions - learnedQuestions;

  const percent =
    totalQuestions === 0
      ? 0
      : Math.round(
          (learnedQuestions / totalQuestions) * 100,
        );

  return {
    category,
    totalQuestions,
    learnedQuestions,
    unseenQuestions,
    percent,

    statusCounts: {
      unseen: progressEntries.filter(
        (progress) =>
          progress.status === "unseen",
      ).length,

      red: progressEntries.filter(
        (progress) => progress.status === "red",
      ).length,

      yellow: progressEntries.filter(
        (progress) =>
          progress.status === "yellow",
      ).length,

      "light-green": progressEntries.filter(
        (progress) =>
          progress.status === "light-green",
      ).length,

      green: progressEntries.filter(
        (progress) =>
          progress.status === "green",
      ).length,
    },
  };
}

export function getAcademyProgress(
  questions: LearningQuestion[] =
    learningQuestions,
  state: LearningProgressState =
    loadLearningProgress(),
): AcademyProgress {
  const subjects = CATEGORIES.map((category) =>
    calculateSubjectProgress(
      category,
      questions,
      state,
    ),
  );

  const totalQuestions = subjects.reduce(
    (sum, subject) =>
      sum + subject.totalQuestions,
    0,
  );

  const learnedQuestions = subjects.reduce(
    (sum, subject) =>
      sum + subject.learnedQuestions,
    0,
  );

  const unseenQuestions =
    totalQuestions - learnedQuestions;

  const percent =
    totalQuestions === 0
      ? 0
      : Math.round(
          (learnedQuestions / totalQuestions) * 100,
        );

  return {
    totalQuestions,
    learnedQuestions,
    unseenQuestions,
    percent,
    subjects,
  };
}

export function getSubjectProgress(
  category: LearningCategory,
  questions: LearningQuestion[] =
    learningQuestions,
  state: LearningProgressState =
    loadLearningProgress(),
): SubjectProgress {
  return calculateSubjectProgress(
    category,
    questions,
    state,
  );
}