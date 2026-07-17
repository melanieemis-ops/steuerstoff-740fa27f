export type CalendarDayNote = {
  id: string;
  date: string; // YYYY-MM-DD
  content: string;
  createdAt: string;
  updatedAt: string;
};

const KEY = "steuerstoff-calendar-day-notes-v1";
const EVENT = "steuerstoff:calendar-day-notes";

type Listener = () => void;
const listeners = new Set<Listener>();

function safeParse(raw: string | null): CalendarDayNote[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (n): n is CalendarDayNote =>
        n &&
        typeof n === "object" &&
        typeof n.id === "string" &&
        typeof n.date === "string" &&
        typeof n.content === "string",
    );
  } catch {
    return [];
  }
}

function readAll(): CalendarDayNote[] {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(KEY));
}

function persist(notes: CalendarDayNote[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(notes));
  } catch {
    // ignore quota
  }
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent(EVENT));
}

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getDayNotes(): CalendarDayNote[] {
  return readAll();
}

export function getDayNoteByDate(date: string): CalendarDayNote | undefined {
  return readAll().find((n) => n.date === date);
}

export function saveDayNote(input: {
  date: string;
  content: string;
}): CalendarDayNote | null {
  const content = input.content.trim();
  const all = readAll();
  const idx = all.findIndex((n) => n.date === input.date);
  const now = new Date().toISOString();

  if (!content) {
    // empty note: remove if existed, otherwise noop
    if (idx >= 0) {
      all.splice(idx, 1);
      persist(all);
    }
    return null;
  }

  if (idx >= 0) {
    const updated: CalendarDayNote = {
      ...all[idx],
      content,
      updatedAt: now,
    };
    all[idx] = updated;
    persist(all);
    return updated;
  }

  const created: CalendarDayNote = {
    id: newId(),
    date: input.date,
    content,
    createdAt: now,
    updatedAt: now,
  };
  all.push(created);
  persist(all);
  return created;
}

export function deleteDayNote(date: string): void {
  const all = readAll().filter((n) => n.date !== date);
  persist(all);
}

export function subscribeDayNotes(l: Listener): () => void {
  listeners.add(l);
  const handler = () => l();
  if (typeof window !== "undefined") {
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
  }
  return () => {
    listeners.delete(l);
    if (typeof window !== "undefined") {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    }
  };
}

export function getDayNoteDateSet(): Set<string> {
  return new Set(readAll().map((n) => n.date));
}
