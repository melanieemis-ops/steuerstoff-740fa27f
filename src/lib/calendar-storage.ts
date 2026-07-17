import type { CalendarEvent } from "./calendar-types";

const KEY = "steuerstoff-calendar-events-v1";

export type StorageChangeListener = () => void;
const listeners = new Set<StorageChangeListener>();

function safeParse(raw: string | null): CalendarEvent[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (e): e is CalendarEvent =>
        e &&
        typeof e === "object" &&
        typeof e.id === "string" &&
        typeof e.title === "string" &&
        typeof e.startDate === "string" &&
        typeof e.allDay === "boolean",
    );
  } catch {
    return [];
  }
}

export function loadEvents(): CalendarEvent[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY));
}

function persist(events: CalendarEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(events));
  } catch {
    // ignore quota errors
  }
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent("steuerstoff:calendar-events"));
}

export function saveAll(events: CalendarEvent[]) {
  persist(events);
}

export function upsertEvent(event: CalendarEvent) {
  const list = loadEvents();
  const idx = list.findIndex((e) => e.id === event.id);
  if (idx >= 0) list[idx] = event;
  else list.push(event);
  persist(list);
}

export function deleteEvent(id: string) {
  const list = loadEvents().filter((e) => e.id !== id);
  persist(list);
}

export function subscribe(l: StorageChangeListener): () => void {
  listeners.add(l);
  const handler = () => l();
  if (typeof window !== "undefined") {
    window.addEventListener("steuerstoff:calendar-events", handler);
    window.addEventListener("storage", handler);
  }
  return () => {
    listeners.delete(l);
    if (typeof window !== "undefined") {
      window.removeEventListener("steuerstoff:calendar-events", handler);
      window.removeEventListener("storage", handler);
    }
  };
}

export function newId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
