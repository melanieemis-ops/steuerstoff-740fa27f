import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  getISOWeek,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { de } from "date-fns/locale";
import type { CalendarEvent } from "./calendar-types";

export const DE_LOCALE = { locale: de, weekStartsOn: 1 as const };

export function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function parseDate(s: string): Date {
  return parseISO(s);
}

export function fmtDE(d: Date | string, pattern = "dd.MM.yyyy"): string {
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, pattern, { locale: de });
}

export function today(): Date {
  return startOfDay(new Date());
}

export function monthMatrix(year: number, month: number): Date[] {
  const first = startOfMonth(new Date(year, month, 1));
  const start = startOfWeek(first, DE_LOCALE);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) days.push(addDays(start, i));
  return days;
}

export function weekDays(ref: Date): Date[] {
  const start = startOfWeek(ref, DE_LOCALE);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isoWeek(d: Date): number {
  return getISOWeek(d);
}

/** Expand recurring events to concrete occurrences within [from, to]. */
export function expandOccurrences(
  event: CalendarEvent,
  from: Date,
  to: Date,
): { date: Date; event: CalendarEvent }[] {
  const results: { date: Date; event: CalendarEvent }[] = [];
  const start = parseISO(event.startDate);
  const rec = event.recurrence;
  const type = rec?.type ?? "none";
  const interval = Math.max(1, rec?.interval ?? 1);
  const until = rec?.until ? parseISO(rec.until) : null;

  const push = (d: Date) => {
    if (d < from || d > to) return;
    if (until && d > until) return;
    results.push({ date: d, event });
  };

  if (type === "none") {
    push(start);
    return results;
  }

  // Cap iterations for safety
  const MAX = 500;
  let cur = start;
  for (let i = 0; i < MAX; i++) {
    if (cur > to) break;
    if (until && cur > until) break;
    if (cur >= from || i === 0) {
      // still push if within
      if (cur >= from && cur <= to) results.push({ date: cur, event });
    }
    switch (type) {
      case "daily":
        cur = addDays(cur, interval);
        break;
      case "weekly":
        cur = addWeeks(cur, interval);
        break;
      case "monthly":
        cur = addMonths(cur, interval);
        break;
      case "yearly":
        cur = addYears(cur, interval);
        break;
      default:
        i = MAX;
    }
  }
  return results;
}

export function occurrencesInRange(
  events: CalendarEvent[],
  from: Date,
  to: Date,
): { date: Date; event: CalendarEvent }[] {
  const out: { date: Date; event: CalendarEvent }[] = [];
  for (const e of events) {
    out.push(...expandOccurrences(e, from, to));
  }
  out.sort((a, b) => {
    const d = a.date.getTime() - b.date.getTime();
    if (d !== 0) return d;
    const ta = a.event.startTime ?? "";
    const tb = b.event.startTime ?? "";
    return ta.localeCompare(tb);
  });
  return out;
}

export function occurrencesOnDay(
  events: CalendarEvent[],
  day: Date,
): { date: Date; event: CalendarEvent }[] {
  return occurrencesInRange(events, startOfDay(day), startOfDay(day)).filter(
    (o) => isSameDay(o.date, day),
  );
}

export function upcomingNext(
  events: CalendarEvent[],
  count: number,
): { date: Date; event: CalendarEvent }[] {
  const from = today();
  const to = addYears(from, 2);
  return occurrencesInRange(events, from, to)
    .filter((o) => !o.event.completed && !o.event.informational)
    .slice(0, count);
}

export function overdueOccurrences(
  events: CalendarEvent[],
): { date: Date; event: CalendarEvent }[] {
  const from = addYears(today(), -2);
  const to = addDays(today(), -1);
  return occurrencesInRange(events, from, to).filter(
    (o) => !o.event.completed && !o.event.informational,
  );
}

export function todaysOccurrences(events: CalendarEvent[]) {
  // Includes informational entries (holidays) so they show up in today's list,
  // but excludes completed ones. Labels that imply "open" must additionally
  // filter out informational at the call site.
  return occurrencesOnDay(events, today()).filter((o) => !o.event.completed);
}

export function thisWeekCount(events: CalendarEvent[]): number {
  const t = today();
  return occurrencesInRange(
    events,
    startOfWeek(t, DE_LOCALE),
    endOfWeek(t, DE_LOCALE),
  ).filter((o) => !o.event.completed && !o.event.informational).length;
}

export function monthCount(
  events: CalendarEvent[],
  year: number,
  month: number,
): number {
  const first = startOfMonth(new Date(year, month, 1));
  return occurrencesInRange(events, first, endOfMonth(first)).filter(
    (o) => !o.event.completed && !o.event.informational,
  ).length;
}

export function daysUntil(dateStr: string): number {
  return differenceInCalendarDays(parseISO(dateStr), today());
}

export function daysUntilDate(d: Date): number {
  return differenceInCalendarDays(d, today());
}

export function inWindow(d: Date, from: Date, to: Date): boolean {
  return isWithinInterval(d, { start: from, end: to });
}

export const WEEKDAY_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
export const WEEKDAY_LONG = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];
export const MONTH_LONG = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];
