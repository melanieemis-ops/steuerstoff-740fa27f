import type { CalendarEvent } from "./calendar-types";
import { formatDateKey, formatTimeLabel } from "./calendar-utils";

function escapeIcs(value: string): string {
  return value.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
}

export function createIcsContent(event: CalendarEvent): string {
  const startDate = event.startDate.replace(/-/g, "");
  const endDate = event.endDate ? event.endDate.replace(/-/g, "") : event.startDate.replace(/-/g, "");
  const startTime = event.allDay ? "" : `${(event.startTime ?? "00:00").replace(/:/g, "")}`;
  const endTime = event.allDay ? "" : `${(event.endTime ?? event.startTime ?? "00:00").replace(/:/g, "")}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//steuerstoff//Calendar//DE",
    "BEGIN:VEVENT",
    `UID:${event.id}@steuerstoff`,
    `DTSTAMP:${formatDateKey(new Date()).replace(/-/g, "")}T000000Z`,
    event.allDay
      ? `DTSTART;VALUE=DATE:${startDate}`
      : `DTSTART:${startDate}T${startTime}`,
    event.allDay
      ? `DTEND;VALUE=DATE:${endDate}`
      : `DTEND:${endDate}T${endTime}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(event.note ?? "")}`,
    `LOCATION:${escapeIcs(event.location ?? "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\n");
}

export function downloadIcsFile(event: CalendarEvent) {
  const content = createIcsContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeTitle = event.title.replace(/[^a-z0-9äöüß]+/gi, "-").toLowerCase();
  link.download = `steuerstoff-${safeTitle}-${event.startDate}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
