import type { CalendarEvent } from "./calendar-types";

export const CALENDAR_STORAGE_KEY = "steuerstoff-calendar-events-v1";

function readStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CALENDAR_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readCalendarEvents(): CalendarEvent[] {
  const raw = readStorage();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as CalendarEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCalendarEvents(events: CalendarEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Ignore storage errors in the first version.
  }
}

export function upsertCalendarEvent(event: CalendarEvent) {
  const events = readCalendarEvents();
  const existingIndex = events.findIndex((item) => item.id === event.id);

  if (existingIndex >= 0) {
    events[existingIndex] = event;
  } else {
    events.unshift(event);
  }

  saveCalendarEvents(events);
  return events;
}

export function deleteCalendarEvent(id: string) {
  const events = readCalendarEvents().filter((event) => event.id !== id);
  saveCalendarEvents(events);
  return events;
}
