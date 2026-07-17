import type { CalendarEvent } from "./calendar-types";

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toIcsDate(dateStr: string): string {
  // YYYY-MM-DD -> YYYYMMDD
  return dateStr.replaceAll("-", "");
}

function toIcsDateTime(dateStr: string, timeStr: string): string {
  // local time (floating) — no Z suffix, works reasonably in most clients
  const t = timeStr.replace(":", "");
  return `${toIcsDate(dateStr)}T${t}00`;
}

function escapeText(s: string): string {
  return s
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function foldLine(line: string): string {
  // 75 octets per line max; simple char-based fold
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let rest = line;
  parts.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 74) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  if (rest.length) parts.push(" " + rest);
  return parts.join("\r\n");
}

export function buildIcs(event: CalendarEvent): string {
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(
    now.getUTCDate(),
  )}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(
    now.getUTCSeconds(),
  )}Z`;

  const uid = `${event.id}@steuerstoff`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//steuerstoff//Fristenkalender//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `SUMMARY:${escapeText(event.title)}`,
  ];

  if (event.allDay) {
    const start = event.startDate;
    const endBase = event.endDate ?? event.startDate;
    // DTEND is exclusive for all-day events → add 1 day
    const endDate = new Date(endBase);
    endDate.setDate(endDate.getDate() + 1);
    const endStr = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;
    lines.push(`DTSTART;VALUE=DATE:${toIcsDate(start)}`);
    lines.push(`DTEND;VALUE=DATE:${toIcsDate(endStr)}`);
  } else {
    const start = event.startDate;
    const startTime = event.startTime ?? "09:00";
    const endDate = event.endDate ?? event.startDate;
    const endTime = event.endTime ?? startTime;
    lines.push(`DTSTART:${toIcsDateTime(start, startTime)}`);
    lines.push(`DTEND:${toIcsDateTime(endDate, endTime)}`);
  }

  if (event.note) lines.push(`DESCRIPTION:${escapeText(event.note)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);

  if (event.recurrence && event.recurrence.type !== "none") {
    const freq = {
      daily: "DAILY",
      weekly: "WEEKLY",
      monthly: "MONTHLY",
      yearly: "YEARLY",
    }[event.recurrence.type];
    let rr = `RRULE:FREQ=${freq}`;
    if (event.recurrence.interval && event.recurrence.interval > 1) {
      rr += `;INTERVAL=${event.recurrence.interval}`;
    }
    if (event.recurrence.until) {
      rr += `;UNTIL=${toIcsDate(event.recurrence.until)}T235959Z`;
    }
    lines.push(rr);
  }

  // First reminder as VALARM
  const firstReminder = [...(event.reminderDays ?? [])].sort((a, b) => b - a)[0];
  if (typeof firstReminder === "number" && firstReminder > 0) {
    lines.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(event.title)}`,
      `TRIGGER:-P${firstReminder}D`,
      "END:VALARM",
    );
  }

  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(foldLine).join("\r\n");
}

export function downloadIcs(event: CalendarEvent) {
  const ics = buildIcs(event);
  const slug = event.title
    .toLowerCase()
    .replaceAll(/[äöüß]/g, (c) =>
      c === "ä" ? "ae" : c === "ö" ? "oe" : c === "ü" ? "ue" : "ss",
    )
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 60);
  const fileName = `steuerstoff-${slug || "termin"}-${event.startDate}.ics`;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
