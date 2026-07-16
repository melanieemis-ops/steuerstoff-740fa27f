import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarDays,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { de } from "date-fns/locale";
import type { CalendarAlertState, CalendarCategory, CalendarOccurrence, CalendarRecurrenceType, CalendarEvent } from "./calendar-types";

export const calendarMonthNames = [
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

export const calendarWeekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function formatDateKey(date: Date | string): string {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, "yyyy-MM-dd");
}

export function formatDateLabel(date: Date | string): string {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, "dd.MM.yyyy", { locale: de });
}

export function formatDateLong(date: Date | string): string {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, "EEEE, dd. MMMM yyyy", { locale: de });
}

export function formatTimeLabel(time?: string): string {
  if (!time) return "Ganztägig";
  return time;
}

export function getMonthLabel(date: Date | string): string {
  const value = typeof date === "string" ? parseISO(date) : date;
  return `${calendarMonthNames[value.getMonth()]} ${value.getFullYear()}`;
}

export function getMonthTitle(date: Date | string): string {
  const value = typeof date === "string" ? parseISO(date) : date;
  return format(value, "MMMM yyyy", { locale: de });
}

export function getWeekTitle(date: Date | string): string {
  const value = typeof date === "string" ? parseISO(date) : date;
  const start = startOfWeek(value, { weekStartsOn: 1 });
  const end = endOfWeek(value, { weekStartsOn: 1 });
  return `${format(start, "dd.MM.", { locale: de })} – ${format(end, "dd.MM.yyyy", { locale: de })}`;
}

export function getISOWeek(date: Date | string): number {
  const value = typeof date === "string" ? parseISO(date) : date;
  return Number(format(value, "ww"));
}

export function getVisibleDaysForMonth(date: Date | string): Date[] {
  const value = typeof date === "string" ? parseISO(date) : date;
  const start = startOfMonth(value);
  const monthStart = startOfWeek(start, { weekStartsOn: 1 });
  const monthEnd = endOfMonth(value);
  const lastDay = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days: Date[] = [];
  let cursor = monthStart;

  while (cursor <= lastDay) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}

export function getVisibleDaysForWeek(date: Date | string): Date[] {
  const value = typeof date === "string" ? parseISO(date) : date;
  const start = startOfWeek(value, { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let index = 0; index < 7; index += 1) {
    days.push(addDays(start, index));
  }
  return days;
}

export function getEventCategoryColor(category: CalendarCategory): string {
  switch (category) {
    case "tax":
      return "border-[#b84d84]/30 bg-[#f6e1eb] text-[#7c2d4b]";
    case "exam":
      return "border-[#b3882d]/30 bg-[#f7ecd0] text-[#8e6120]";
    case "learning":
      return "border-[#2f6d4f]/30 bg-[#dff2e6] text-[#2a5b41]";
    case "client":
      return "border-[#243d68]/30 bg-[#e8eefb] text-[#243d68]";
    case "office":
      return "border-[#6b4a8a]/30 bg-[#efe6f9] text-[#6b4a8a]";
    default:
      return "border-[#4b5563]/20 bg-[#f3f4f6] text-[#374151]";
  }
}

export function getEventCategoryLabel(category: CalendarCategory): string {
  switch (category) {
    case "tax":
      return "Steuerfrist";
    case "exam":
      return "Prüfung";
    case "learning":
      return "Lernen";
    case "client":
      return "Mandant";
    case "office":
      return "Kanzlei";
    default:
      return "Persönlich";
  }
}

export function getReminderLabel(reminder: string): string {
  switch (reminder) {
    case "same-day":
      return "am selben Tag";
    case "1-day":
      return "1 Tag vorher";
    case "3-days":
      return "3 Tage vorher";
    case "7-days":
      return "7 Tage vorher";
    case "14-days":
      return "14 Tage vorher";
    case "custom":
      return "benutzerdefiniert";
    default:
      return "keine Erinnerung";
  }
}

function buildRecurrenceDates(event: CalendarEvent, startDate: string, endDate: string): string[] {
  if (!event.recurrence || event.recurrence.type === "none") {
    return [event.startDate];
  }

  const dates: string[] = [];
  const interval = event.recurrence.interval ?? 1;
  const until = event.recurrence.until ? parseISO(event.recurrence.until) : parseISO(endDate);
  let cursor = parseISO(event.startDate);

  while (cursor <= until) {
    const value = formatDateKey(cursor);
    if (value <= endDate && value >= startDate) {
      dates.push(value);
    }
    if (event.recurrence.type === "daily") {
      cursor = addDays(cursor, interval);
    } else if (event.recurrence.type === "weekly") {
      cursor = addWeeks(cursor, interval);
    } else if (event.recurrence.type === "monthly") {
      cursor = addMonths(cursor, interval);
    } else if (event.recurrence.type === "yearly") {
      cursor = addYears(cursor, interval);
    } else {
      break;
    }
  }

  return dates;
}

export function buildOccurrences(events: CalendarEvent[], startDate: string, endDate: string): CalendarOccurrence[] {
  const occurrences: CalendarOccurrence[] = [];

  for (const event of events) {
    const dates = buildRecurrenceDates(event, startDate, endDate);
    for (const date of dates) {
      occurrences.push({
        ...event,
        occurrenceDate: date,
        occurrenceKey: `${event.id}-${date}`,
      });
    }
  }

  return occurrences.sort((a, b) => a.occurrenceDate.localeCompare(b.occurrenceDate));
}

export function getAlertState(events: CalendarEvent[]): CalendarAlertState {
  const today = formatDateKey(new Date());
  const openEvents = events.filter((event) => !event.completed);
  const overdue = openEvents.filter((event) => {
    const eventDate = event.startDate;
    return isBefore(parseISO(eventDate), parseISO(today));
  });
  const todayEvents = openEvents.filter((event) => event.startDate === today);
  const nextEvent = openEvents
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  return {
    hasAlerts: overdue.length > 0 || todayEvents.length > 0,
    todayCount: todayEvents.length,
    overdueCount: overdue.length,
    nextEvent,
  };
}

export function getDaysUntil(date: string): number {
  const today = parseISO(formatDateKey(new Date()));
  const target = parseISO(date);
  return differenceInCalendarDays(target, today);
}

export function getEventStatusLabel(event: CalendarEvent): string {
  if (event.completed) return "Erledigt";
  const daysUntil = getDaysUntil(event.startDate);
  if (daysUntil < 0) return "Überfällig";
  if (daysUntil === 0) return "Heute";
  if (daysUntil <= 7) return "Diese Woche";
  return "Geplant";
}

export function createEmptyEventDate(date: string): CalendarEvent {
  return {
    id: `temp-${Date.now()}`,
    title: "",
    startDate: date,
    endDate: date,
    allDay: true,
    category: "tax",
    reminder: "7-days",
    reminderDays: [7],
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const TAX_DEADLINE_TEMPLATES = [
  {
    id: "ust-va",
    title: "Umsatzsteuer-Voranmeldung",
    category: "tax" as const,
    reminder: "7-days" as const,
    recurrence: { type: "monthly" as const, interval: 1 },
  },
  {
    id: "lohnsteuer",
    title: "Lohnsteuer-Anmeldung",
    category: "tax" as const,
    reminder: "3-days" as const,
    recurrence: { type: "monthly" as const, interval: 1 },
  },
  {
    id: "einkommensteuer",
    title: "Einkommensteuer-Vorauszahlung",
    category: "tax" as const,
    reminder: "14-days" as const,
    recurrence: { type: "yearly" as const, interval: 1 },
  },
  {
    id: "korpsteuer",
    title: "Körperschaftsteuer-Vorauszahlung",
    category: "tax" as const,
    reminder: "14-days" as const,
    recurrence: { type: "yearly" as const, interval: 1 },
  },
  {
    id: "gewerbesteuer",
    title: "Gewerbesteuer-Vorauszahlung",
    category: "tax" as const,
    reminder: "14-days" as const,
    recurrence: { type: "yearly" as const, interval: 1 },
  },
  {
    id: "abgabe",
    title: "Abgabefrist",
    category: "tax" as const,
    reminder: "7-days" as const,
    recurrence: { type: "none" as const },
  },
  {
    id: "einspruch",
    title: "Einspruchsfrist",
    category: "tax" as const,
    reminder: "same-day" as const,
    recurrence: { type: "none" as const },
  },
  {
    id: "pruefung",
    title: "Steuerfachwirt-Prüfung",
    category: "exam" as const,
    reminder: "14-days" as const,
    recurrence: { type: "none" as const },
  },
  {
    id: "fortbildung",
    title: "Fortbildung",
    category: "learning" as const,
    reminder: "7-days" as const,
    recurrence: { type: "yearly" as const, interval: 1 },
  },
];
