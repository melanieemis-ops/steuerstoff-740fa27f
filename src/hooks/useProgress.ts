import { useCallback, useState, useEffect } from "react";

export interface ActivityRecord {
  id: string;
  type:
    | "question_correct"
    | "question_wrong"
    | "card_reviewed"
    | "case_completed"
    | "training_session"
    | "mistake_mastered"
    | "exam_completed";
  category: string;
  title: string;
  timestamp: number;
  source?: string;
  examData?: {
    correctCount: number;
    totalCount: number;
    accuracy: number;
  };
}

export interface CategoryProgress {
  categoryId: string;
  categoryName: string;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  reviewedCards: number;
  completedItems: number;
  lastActivityAt: number | null;
}

export interface ProgressData {
  version: 1;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalLearningCardsReviewed: number;
  completedCases: number;
  completedTrainingSessions: number;
  totalLearningMinutes: number;
  completedExams: number;
  totalExamQuestions: number;
  totalExamCorrect: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: number | null;
  firstActivityDate: number | null;
  activityByDate: Record<string, number>;
  progressByCategory: Record<string, CategoryProgress>;
  recentActivities: ActivityRecord[];
}

const STORAGE_KEY = "steuerstoff_progress_v1";
const MAX_RECENT_ACTIVITIES = 100;

const EMPTY_PROGRESS: ProgressData = {
  version: 1,
  totalQuestionsAnswered: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  totalLearningCardsReviewed: 0,
  completedCases: 0,
  completedTrainingSessions: 0,
  totalLearningMinutes: 0,
  completedExams: 0,
  totalExamQuestions: 0,
  totalExamCorrect: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  firstActivityDate: null,
  activityByDate: {},
  progressByCategory: {},
  recentActivities: [],
};

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function loadProgress(): ProgressData {
  if (!canUseStorage()) {
    return { ...EMPTY_PROGRESS };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...EMPTY_PROGRESS };
    }

    const parsed = JSON.parse(raw) as Partial<ProgressData>;
    if (parsed.version !== 1) {
      return { ...EMPTY_PROGRESS };
    }

    return {
      version: 1,
      totalQuestionsAnswered: parsed.totalQuestionsAnswered ?? 0,
      correctAnswers: parsed.correctAnswers ?? 0,
      wrongAnswers: parsed.wrongAnswers ?? 0,
      totalLearningCardsReviewed: parsed.totalLearningCardsReviewed ?? 0,
      completedCases: parsed.completedCases ?? 0,
      completedTrainingSessions: parsed.completedTrainingSessions ?? 0,
      totalLearningMinutes: parsed.totalLearningMinutes ?? 0,
      completedExams: parsed.completedExams ?? 0,
      totalExamQuestions: parsed.totalExamQuestions ?? 0,
      totalExamCorrect: parsed.totalExamCorrect ?? 0,
      currentStreak: parsed.currentStreak ?? 0,
      longestStreak: parsed.longestStreak ?? 0,
      lastActivityDate: parsed.lastActivityDate ?? null,
      firstActivityDate: parsed.firstActivityDate ?? null,
      activityByDate: parsed.activityByDate ?? {},
      progressByCategory: parsed.progressByCategory ?? {},
      recentActivities: parsed.recentActivities ?? [],
    };
  } catch {
    return { ...EMPTY_PROGRESS };
  }
}

function saveProgress(data: ProgressData): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or inaccessible
  }
}

function getTodayString(): string {
  const now = new Date();
  return now.toLocaleDateString("en-CA"); // YYYY-MM-DD format
}

function getDateString(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-CA");
}

function updateStreak(data: ProgressData, today: string): ProgressData {
  if (!data.lastActivityDate) {
    return {
      ...data,
      currentStreak: 1,
      longestStreak: Math.max(1, data.longestStreak),
    };
  }

  const lastDate = getDateString(data.lastActivityDate);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toLocaleDateString("en-CA");

  if (lastDate === today) {
    // Already recorded today
    return data;
  }

  if (lastDate === yesterdayString) {
    // Continuous streak
    const newStreak = data.currentStreak + 1;
    return {
      ...data,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, data.longestStreak),
    };
  }

  // Streak broken
  return {
    ...data,
    currentStreak: 1,
  };
}

export function recordQuestionAnswered(
  questionId: string,
  category: string,
  topic: string,
  isCorrect: boolean,
  source?: string,
): void {
  const data = loadProgress();
  const today = getTodayString();
  const now = Date.now();

  data.totalQuestionsAnswered += 1;
  if (isCorrect) {
    data.correctAnswers += 1;
  } else {
    data.wrongAnswers += 1;
  }

  // Update daily activity
  data.activityByDate[today] = (data.activityByDate[today] ?? 0) + 1;

  // Update last activity
  data.lastActivityDate = now;
  if (!data.firstActivityDate) {
    data.firstActivityDate = now;
  }

  // Update streak
  const streakData = updateStreak(data, today);
  data.currentStreak = streakData.currentStreak;
  data.longestStreak = streakData.longestStreak;

  // Update category
  const catKey = category;
  if (!data.progressByCategory[catKey]) {
    data.progressByCategory[catKey] = {
      categoryId: catKey,
      categoryName: category,
      answeredQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      accuracy: 0,
      reviewedCards: 0,
      completedItems: 0,
      lastActivityAt: null,
    };
  }

  const cat = data.progressByCategory[catKey];
  cat.answeredQuestions += 1;
  if (isCorrect) {
    cat.correctAnswers += 1;
  } else {
    cat.wrongAnswers += 1;
  }
  cat.accuracy = Math.round((cat.correctAnswers / cat.answeredQuestions) * 100);
  cat.lastActivityAt = now;

  // Add to recent activities
  const activity: ActivityRecord = {
    id: `${questionId}-${now}`,
    type: isCorrect ? "question_correct" : "question_wrong",
    category: category,
    title: topic || "Frage",
    timestamp: now,
    source,
  };

  data.recentActivities.unshift(activity);
  if (data.recentActivities.length > MAX_RECENT_ACTIVITIES) {
    data.recentActivities = data.recentActivities.slice(0, MAX_RECENT_ACTIVITIES);
  }

  saveProgress(data);
}

export function recordLearningCardReviewed(category: string, title?: string): void {
  const data = loadProgress();
  const today = getTodayString();
  const now = Date.now();

  data.totalLearningCardsReviewed += 1;
  data.activityByDate[today] = (data.activityByDate[today] ?? 0) + 1;
  data.lastActivityDate = now;
  if (!data.firstActivityDate) {
    data.firstActivityDate = now;
  }

  const streakData = updateStreak(data, today);
  data.currentStreak = streakData.currentStreak;
  data.longestStreak = streakData.longestStreak;

  const catKey = category;
  if (!data.progressByCategory[catKey]) {
    data.progressByCategory[catKey] = {
      categoryId: catKey,
      categoryName: category,
      answeredQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      accuracy: 0,
      reviewedCards: 0,
      completedItems: 0,
      lastActivityAt: null,
    };
  }

  const cat = data.progressByCategory[catKey];
  cat.reviewedCards += 1;
  cat.lastActivityAt = now;

  const activity: ActivityRecord = {
    id: `card-${now}`,
    type: "card_reviewed",
    category: category,
    title: title || "Lernkarte",
    timestamp: now,
  };

  data.recentActivities.unshift(activity);
  if (data.recentActivities.length > MAX_RECENT_ACTIVITIES) {
    data.recentActivities = data.recentActivities.slice(0, MAX_RECENT_ACTIVITIES);
  }

  saveProgress(data);
}

export function recordCaseCompleted(category: string, caseTitle?: string): void {
  const data = loadProgress();
  const today = getTodayString();
  const now = Date.now();

  data.completedCases += 1;
  data.activityByDate[today] = (data.activityByDate[today] ?? 0) + 1;
  data.lastActivityDate = now;
  if (!data.firstActivityDate) {
    data.firstActivityDate = now;
  }

  const streakData = updateStreak(data, today);
  data.currentStreak = streakData.currentStreak;
  data.longestStreak = streakData.longestStreak;

  const catKey = category;
  if (!data.progressByCategory[catKey]) {
    data.progressByCategory[catKey] = {
      categoryId: catKey,
      categoryName: category,
      answeredQuestions: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      accuracy: 0,
      reviewedCards: 0,
      completedItems: 0,
      lastActivityAt: null,
    };
  }

  const cat = data.progressByCategory[catKey];
  cat.completedItems += 1;
  cat.lastActivityAt = now;

  const activity: ActivityRecord = {
    id: `case-${now}`,
    type: "case_completed",
    category: category,
    title: caseTitle || "Klausurfall",
    timestamp: now,
  };

  data.recentActivities.unshift(activity);
  if (data.recentActivities.length > MAX_RECENT_ACTIVITIES) {
    data.recentActivities = data.recentActivities.slice(0, MAX_RECENT_ACTIVITIES);
  }

  saveProgress(data);
}

export function recordTrainingSession(correctCount: number, wrongCount: number): void {
  const data = loadProgress();
  const today = getTodayString();
  const now = Date.now();

  data.completedTrainingSessions += 1;
  data.activityByDate[today] = (data.activityByDate[today] ?? 0) + 1;
  data.lastActivityDate = now;
  if (!data.firstActivityDate) {
    data.firstActivityDate = now;
  }

  const streakData = updateStreak(data, today);
  data.currentStreak = streakData.currentStreak;
  data.longestStreak = streakData.longestStreak;

  const activity: ActivityRecord = {
    id: `training-${now}`,
    type: "training_session",
    category: "Fehlertrainer",
    title: `Trainingsrunde (${correctCount} richtig)`,
    timestamp: now,
  };

  data.recentActivities.unshift(activity);
  if (data.recentActivities.length > MAX_RECENT_ACTIVITIES) {
    data.recentActivities = data.recentActivities.slice(0, MAX_RECENT_ACTIVITIES);
  }

  saveProgress(data);
}

export function recordMistakeMastered(category: string, topic?: string): void {
  const data = loadProgress();
  const today = getTodayString();
  const now = Date.now();

  data.activityByDate[today] = (data.activityByDate[today] ?? 0) + 1;
  data.lastActivityDate = now;

  const activity: ActivityRecord = {
    id: `mastered-${now}`,
    type: "mistake_mastered",
    category: category,
    title: topic || "Fehlerfrage gemeistert",
    timestamp: now,
  };

  data.recentActivities.unshift(activity);
  if (data.recentActivities.length > MAX_RECENT_ACTIVITIES) {
    data.recentActivities = data.recentActivities.slice(0, MAX_RECENT_ACTIVITIES);
  }

  saveProgress(data);
}

export function recordExam(examData: {
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  duration: number;
  accuracy: number;
  categoryResults: Record<string, { correct: number; total: number }>;
}): void {
  const data = loadProgress();
  const today = getTodayString();
  const now = Date.now();

  data.completedExams += 1;
  data.totalExamQuestions += examData.questionCount;
  data.totalExamCorrect += examData.correctCount;
  data.activityByDate[today] = (data.activityByDate[today] ?? 0) + 1;
  data.lastActivityDate = now;
  if (!data.firstActivityDate) {
    data.firstActivityDate = now;
  }

  const streakData = updateStreak(data, today);
  data.currentStreak = streakData.currentStreak;
  data.longestStreak = streakData.longestStreak;

  // Update category results
  Object.entries(examData.categoryResults).forEach(([category, results]) => {
    const catKey = category;
    if (!data.progressByCategory[catKey]) {
      data.progressByCategory[catKey] = {
        categoryId: catKey,
        categoryName: category,
        answeredQuestions: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        accuracy: 0,
        reviewedCards: 0,
        completedItems: 0,
        lastActivityAt: null,
      };
    }

    const cat = data.progressByCategory[catKey];
    cat.answeredQuestions += results.total;
    cat.correctAnswers += results.correct;
    cat.wrongAnswers += results.total - results.correct;
    if (results.total > 0) {
      cat.accuracy = Math.round((cat.correctAnswers / cat.answeredQuestions) * 100);
    }
    cat.lastActivityAt = now;
  });

  const activity: ActivityRecord = {
    id: `exam-${now}`,
    type: "exam_completed",
    category: "Prüfungssimulation",
    title: `Prüfung (${examData.accuracy}%, ${examData.correctCount}/${examData.questionCount})`,
    timestamp: now,
    examData: {
      correctCount: examData.correctCount,
      totalCount: examData.questionCount,
      accuracy: examData.accuracy,
    },
  };

  data.recentActivities.unshift(activity);
  if (data.recentActivities.length > MAX_RECENT_ACTIVITIES) {
    data.recentActivities = data.recentActivities.slice(0, MAX_RECENT_ACTIVITIES);
  }

  saveProgress(data);
}

export function getOverallAccuracy(): number {
  const data = loadProgress();
  if (data.totalQuestionsAnswered === 0) return 0;
  return Math.round((data.correctAnswers / data.totalQuestionsAnswered) * 100);
}

export function getCategoryProgress(): CategoryProgress[] {
  const data = loadProgress();
  return Object.values(data.progressByCategory).sort(
    (a, b) => (b.lastActivityAt ?? 0) - (a.lastActivityAt ?? 0),
  );
}

export function getLast7DaysActivity(): Record<string, number> {
  const data = loadProgress();
  const result: Record<string, number> = {};

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-CA");
    result[dateStr] = data.activityByDate[dateStr] ?? 0;
  }

  return result;
}

export function resetProgress(): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Could not remove
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(loadProgress);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(loadProgress());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const recordQuestion = useCallback(
    (questionId: string, category: string, topic: string, isCorrect: boolean, source?: string) => {
      recordQuestionAnswered(questionId, category, topic, isCorrect, source);
      setProgress(loadProgress());
    },
    [],
  );

  const recordCard = useCallback((category: string, title?: string) => {
    recordLearningCardReviewed(category, title);
    setProgress(loadProgress());
  }, []);

  const recordCase = useCallback((category: string, caseTitle?: string) => {
    recordCaseCompleted(category, caseTitle);
    setProgress(loadProgress());
  }, []);

  const recordSession = useCallback((correctCount: number, wrongCount: number) => {
    recordTrainingSession(correctCount, wrongCount);
    setProgress(loadProgress());
  }, []);

  const recordMastered = useCallback((category: string, topic?: string) => {
    recordMistakeMastered(category, topic);
    setProgress(loadProgress());
  }, []);

  const recordExamCallback = useCallback(
    (examData: {
      questionCount: number;
      correctCount: number;
      wrongCount: number;
      unansweredCount: number;
      duration: number;
      accuracy: number;
      categoryResults: Record<string, { correct: number; total: number }>;
    }) => {
      recordExam(examData);
      setProgress(loadProgress());
    },
    [],
  );

  return {
    progress,
    recordQuestion,
    recordCard,
    recordCase,
    recordSession,
    recordMastered,
    recordExam: recordExamCallback,
    getAccuracy: getOverallAccuracy,
    getCategoryProgress,
    getLast7Days: getLast7DaysActivity,
    reset: resetProgress,
  };
}
