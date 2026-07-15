// src/lib/xp.ts

export const XP_PER_CORRECT_ANSWER = 10;

export const XP_PER_PERFECT_ROUND = 50;

export interface UserXP {
  xp: number;
  level: number;
}

export function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 1000) return 4;
  if (xp < 2000) return 5;
  if (xp < 3500) return 6;
  if (xp < 5000) return 7;
  if (xp < 7000) return 8;
  if (xp < 10000) return 9;

  return 10 + Math.floor((xp - 10000) / 2500);
}

export function addXP(currentXP: number, amount: number): UserXP {
  const xp = currentXP + amount;

  return {
    xp,
    level: calculateLevel(xp),
  };
}

export function xpForCorrectAnswer(currentXP: number): UserXP {
  return addXP(currentXP, XP_PER_CORRECT_ANSWER);
}

export function xpForPerfectRound(currentXP: number): UserXP {
  return addXP(currentXP, XP_PER_PERFECT_ROUND);
}

export function progressToNextLevel(xp: number) {
  const level = calculateLevel(xp);

  const levelBorders = [
    0,
    100,
    250,
    500,
    1000,
    2000,
    3500,
    5000,
    7000,
    10000,
  ];

  const current =
    levelBorders[Math.min(level - 1, levelBorders.length - 1)];

  const next =
    levelBorders[Math.min(level, levelBorders.length - 1)] ??
    current + 2500;

  return {
    level,
    currentXP: xp,
    currentLevelXP: current,
    nextLevelXP: next,
    percent:
      ((xp - current) / (next - current)) * 100,
  };
}