// src/lib/profile.ts

const STORAGE_KEY = "steuerstoff_username";

export function getUserName(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(STORAGE_KEY) ?? "";
}

export function saveUserName(name: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, name.trim());
}

export function clearUserName(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

export function hasUserName(): boolean {
  return getUserName().length > 0;
}