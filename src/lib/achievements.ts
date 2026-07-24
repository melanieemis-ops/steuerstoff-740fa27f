import type { LearningProgressState, LearningStatistics } from "@/lib/learningProgress";

export type AchievementIcon =
  | "sparkles"
  | "check"
  | "target"
  | "flame"
  | "trophy"
  | "brain"
  | "star"
  | "crown";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  current: number;
  target: number;
  unlocked: boolean;
  unit?: string;
}

function toLocalDateKey(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function getCurrentLearningStreak(state: LearningProgressState): number {
  const activeDays = new Set(
    Object.values(state.questions)
      .map((progress) => progress.lastAnsweredAt)
      .filter((value): value is string => Boolean(value))
      .map(toLocalDateKey)
      .filter((value): value is string => Boolean(value)),
  );

  if (activeDays.size === 0) return 0;

  const today = new Date();
  const todayKey = toLocalDateKey(today.toISOString());
  const yesterday = addDays(today, -1);
  const yesterdayKey = toLocalDateKey(yesterday.toISOString());

  let cursor: Date;
  if (todayKey && activeDays.has(todayKey)) cursor = today;
  else if (yesterdayKey && activeDays.has(yesterdayKey)) cursor = yesterday;
  else return 0;

  let streak = 0;
  while (true) {
    const key = toLocalDateKey(cursor.toISOString());
    if (!key || !activeDays.has(key)) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function buildAchievements(
  statistics: LearningStatistics,
  state: LearningProgressState,
  totalQuestions: number,
): Achievement[] {
  const streak = getCurrentLearningStreak(state);
  const seen = Math.max(0, totalQuestions - statistics.unseen);
  const mastered = statistics.green;

  return [
    {
      id: "first-step",
      title: "Erster Schritt",
      description: "Beantworte deine erste Lernfrage.",
      icon: "sparkles",
      current: statistics.totalAnswered,
      target: 1,
      unlocked: statistics.totalAnswered >= 1,
    },
    {
      id: "ten-questions",
      title: "Warmgelaufen",
      description: "Beantworte insgesamt 10 Fragen.",
      icon: "check",
      current: statistics.totalAnswered,
      target: 10,
      unlocked: statistics.totalAnswered >= 10,
    },
    {
      id: "fifty-questions",
      title: "Fleißige Steuerkraft",
      description: "Beantworte insgesamt 50 Fragen.",
      icon: "brain",
      current: statistics.totalAnswered,
      target: 50,
      unlocked: statistics.totalAnswered >= 50,
    },
    {
      id: "hundred-questions",
      title: "Lernmarathon",
      description: "Beantworte insgesamt 100 Fragen.",
      icon: "trophy",
      current: statistics.totalAnswered,
      target: 100,
      unlocked: statistics.totalAnswered >= 100,
    },
    {
      id: "ten-correct",
      title: "Treffsicher",
      description: "Beantworte 10 Fragen richtig.",
      icon: "target",
      current: statistics.totalCorrect,
      target: 10,
      unlocked: statistics.totalCorrect >= 10,
    },
    {
      id: "accuracy-80",
      title: "Sicheres Wissen",
      description: "Erreiche mindestens 80 % Trefferquote bei 20 Antworten.",
      icon: "star",
      current: statistics.totalAnswered >= 20 ? statistics.accuracy : 0,
      target: 80,
      unit: "%",
      unlocked: statistics.totalAnswered >= 20 && statistics.accuracy >= 80,
    },
    {
      id: "master-five",
      title: "Fünf gemeistert",
      description: "Bringe 5 Fragen auf den grünen Lernstatus.",
      icon: "crown",
      current: mastered,
      target: 5,
      unlocked: mastered >= 5,
    },
    {
      id: "streak-three",
      title: "Drei-Tage-Serie",
      description: "Lerne an 3 aufeinanderfolgenden Tagen.",
      icon: "flame",
      current: streak,
      target: 3,
      unit: " Tage",
      unlocked: streak >= 3,
    },
    {
      id: "streak-seven",
      title: "Wochenserie",
      description: "Lerne an 7 aufeinanderfolgenden Tagen.",
      icon: "flame",
      current: streak,
      target: 7,
      unit: " Tage",
      unlocked: streak >= 7,
    },
    {
      id: "explorer",
      title: "Alles einmal gesehen",
      description: "Bearbeite jede verfügbare Lernfrage mindestens einmal.",
      icon: "trophy",
      current: seen,
      target: totalQuestions,
      unlocked: totalQuestions > 0 && seen >= totalQuestions,
    },
  ];
}
