export type LearningStatus =
  | "unseen"
  | "red"
  | "yellow"
  | "light-green"
  | "green";

export interface QuestionProgress {
  questionId: string;
  attempts: number;
  correctAnswers: number;
  wrongAnswers: number;
  correctStreak: number;
  status: LearningStatus;
  lastAnsweredAt: string | null;
}

export interface LearningProgressState {
  version: 1;
  questions: Record<string, QuestionProgress>;
}

export interface LearningStatistics {
  totalAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  accuracy: number;
  unseen: number;
  red: number;
  yellow: number;
  lightGreen: number;
  green: number;
}

const STORAGE_KEY = "steuerstoff.learning.progress.v1";

const EMPTY_STATE: LearningProgressState = {
  version: 1,
  questions: {},
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function createQuestionProgress(
  questionId: string,
): QuestionProgress {
  return {
    questionId,
    attempts: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    correctStreak: 0,
    status: "unseen",
    lastAnsweredAt: null,
  };
}

function determineStatus(
  progress: QuestionProgress,
): LearningStatus {
  if (progress.attempts === 0) {
    return "unseen";
  }

  if (progress.correctStreak >= 4) {
    return "green";
  }

  if (progress.correctStreak >= 2) {
    return "light-green";
  }

  if (progress.correctStreak === 1) {
    return "yellow";
  }

  return "red";
}

export function loadLearningProgress(): LearningProgressState {
  if (!canUseStorage()) {
    return EMPTY_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return EMPTY_STATE;
    }

    const parsed = JSON.parse(raw) as Partial<LearningProgressState>;

    if (
      parsed.version !== 1 ||
      !parsed.questions ||
      typeof parsed.questions !== "object"
    ) {
      return EMPTY_STATE;
    }

    return {
      version: 1,
      questions: parsed.questions,
    };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveLearningProgress(
  state: LearningProgressState,
): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch {
    // Beispielsweise privater Browsermodus oder voller Speicher.
  }
}

export function getQuestionProgress(
  questionId: string,
  state = loadLearningProgress(),
): QuestionProgress {
  return (
    state.questions[questionId] ??
    createQuestionProgress(questionId)
  );
}

export function recordLearningAnswer(
  questionId: string,
  isCorrect: boolean,
): LearningProgressState {
  const state = loadLearningProgress();
  const previous = getQuestionProgress(questionId, state);

  const updated: QuestionProgress = {
    ...previous,
    attempts: previous.attempts + 1,
    correctAnswers:
      previous.correctAnswers + (isCorrect ? 1 : 0),
    wrongAnswers:
      previous.wrongAnswers + (isCorrect ? 0 : 1),
    correctStreak: isCorrect
      ? previous.correctStreak + 1
      : 0,
    lastAnsweredAt: new Date().toISOString(),
  };

  updated.status = determineStatus(updated);

  const nextState: LearningProgressState = {
    version: 1,
    questions: {
      ...state.questions,
      [questionId]: updated,
    },
  };

  saveLearningProgress(nextState);

  return nextState;
}

export function getWrongQuestionIds(
  state = loadLearningProgress(),
): string[] {
  return Object.values(state.questions)
    .filter(
      (progress) =>
        progress.wrongAnswers > 0 &&
        progress.status !== "green",
    )
    .sort((a, b) => {
      const aDate = a.lastAnsweredAt ?? "";
      const bDate = b.lastAnsweredAt ?? "";

      return bDate.localeCompare(aDate);
    })
    .map((progress) => progress.questionId);
}

export function getLearningStatistics(
  allQuestionIds: string[],
  state = loadLearningProgress(),
): LearningStatistics {
  const progressEntries = allQuestionIds.map((questionId) =>
    getQuestionProgress(questionId, state),
  );

  const totalAnswered = progressEntries.reduce(
    (sum, progress) => sum + progress.attempts,
    0,
  );

  const totalCorrect = progressEntries.reduce(
    (sum, progress) => sum + progress.correctAnswers,
    0,
  );

  const totalWrong = progressEntries.reduce(
    (sum, progress) => sum + progress.wrongAnswers,
    0,
  );

  return {
    totalAnswered,
    totalCorrect,
    totalWrong,
    accuracy:
      totalAnswered > 0
        ? Math.round((totalCorrect / totalAnswered) * 100)
        : 0,
    unseen: progressEntries.filter(
      (progress) => progress.status === "unseen",
    ).length,
    red: progressEntries.filter(
      (progress) => progress.status === "red",
    ).length,
    yellow: progressEntries.filter(
      (progress) => progress.status === "yellow",
    ).length,
    lightGreen: progressEntries.filter(
      (progress) => progress.status === "light-green",
    ).length,
    green: progressEntries.filter(
      (progress) => progress.status === "green",
    ).length,
  };
}

export function resetLearningProgress(): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Speicher konnte nicht verändert werden.
  }
}