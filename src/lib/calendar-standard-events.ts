import type { CalendarEvent, CalendarCategory } from "./calendar-types";

/** Supported Bundesländer for holiday computation. */
export type Bundesland = "BY" | "DE";

export const BUNDESLAND_OPTIONS: { value: Bundesland; label: string }[] = [
  { value: "BY", label: "Bayern" },
  { value: "DE", label: "Nur bundesweite Feiertage" },
];

export type PresetSettings = {
  showFilingDeadlines: boolean;
  showEStKStVZ: boolean;
  showGewStVZ: boolean;
  showMonthlyUStLSt: boolean;
  showHolidays: boolean;
  bundesland: Bundesland;
};

export const DEFAULT_PRESET_SETTINGS: PresetSettings = {
  showFilingDeadlines: true,
  showEStKStVZ: true,
  showGewStVZ: true,
  showMonthlyUStLSt: false,
  showHolidays: true,
  bundesland: "BY",
};

const PRESET_KEY = "steuerstoff-calendar-presets-v1";
const PRESET_EVENT = "steuerstoff:calendar-presets";

type Listener = () => void;
const listeners = new Set<Listener>();

export function loadPresetSettings(): PresetSettings {
  if (typeof window === "undefined") return DEFAULT_PRESET_SETTINGS;
  try {
    const raw = window.localStorage.getItem(PRESET_KEY);
    if (!raw) return DEFAULT_PRESET_SETTINGS;
    const data = JSON.parse(raw) as Partial<PresetSettings>;
    return { ...DEFAULT_PRESET_SETTINGS, ...data };
  } catch {
    return DEFAULT_PRESET_SETTINGS;
  }
}

export function savePresetSettings(s: PresetSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PRESET_KEY, JSON.stringify(s));
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
  window.dispatchEvent(new CustomEvent(PRESET_EVENT));
}

export function subscribePresetSettings(l: Listener): () => void {
  listeners.add(l);
  const handler = () => l();
  if (typeof window !== "undefined") {
    window.addEventListener(PRESET_EVENT, handler);
    window.addEventListener("storage", handler);
  }
  return () => {
    listeners.delete(l);
    if (typeof window !== "undefined") {
      window.removeEventListener(PRESET_EVENT, handler);
      window.removeEventListener("storage", handler);
    }
  };
}

// ============================================================
// Date helpers (pure, no external deps)
// ============================================================

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function iso(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}

function isoFromDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Meeus/Jones/Butcher — Easter Sunday (Gregorian). */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

// ============================================================
// Holidays
// ============================================================

type Holiday = { date: string; title: string };

/** Nationwide statutory holidays in Germany. */
function nationalHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);
  return [
    { date: iso(year, 1, 1), title: "Neujahr" },
    { date: isoFromDate(addDays(easter, -2)), title: "Karfreitag" },
    { date: isoFromDate(addDays(easter, 1)), title: "Ostermontag" },
    { date: iso(year, 5, 1), title: "Tag der Arbeit" },
    { date: isoFromDate(addDays(easter, 39)), title: "Christi Himmelfahrt" },
    { date: isoFromDate(addDays(easter, 50)), title: "Pfingstmontag" },
    { date: iso(year, 10, 3), title: "Tag der Deutschen Einheit" },
    { date: iso(year, 12, 25), title: "1. Weihnachtstag" },
    { date: iso(year, 12, 26), title: "2. Weihnachtstag" },
  ];
}

/** Bavaria-only additions on top of nationwide. */
function bavarianExtraHolidays(year: number): Holiday[] {
  const easter = easterSunday(year);
  return [
    { date: iso(year, 1, 6), title: "Heilige Drei Könige" },
    { date: isoFromDate(addDays(easter, 60)), title: "Fronleichnam" },
    { date: iso(year, 11, 1), title: "Allerheiligen" },
  ];
}

export function computeHolidays(year: number, bl: Bundesland): Holiday[] {
  const list = nationalHolidays(year);
  if (bl === "BY") list.push(...bavarianExtraHolidays(year));
  list.sort((a, b) => a.date.localeCompare(b.date));
  return list;
}

function holidaySet(year: number, bl: Bundesland): Set<string> {
  return new Set(computeHolidays(year, bl).map((h) => h.date));
}

// ============================================================
// Deadline shifting (weekend + statutory holiday)
// ============================================================

function isWeekend(d: Date): boolean {
  const w = d.getDay();
  return w === 0 || w === 6;
}

function shiftToNextBusinessDay(
  d: Date,
  holidays: Set<string>,
): { date: Date; shifted: boolean } {
  let cur = new Date(d);
  let shifted = false;
  for (let i = 0; i < 10; i++) {
    if (!isWeekend(cur) && !holidays.has(isoFromDate(cur))) break;
    cur = addDays(cur, 1);
    shifted = true;
  }
  return { date: cur, shifted };
}

// ============================================================
// Event factory
// ============================================================

const NOW_ISO = "2024-01-01T00:00:00.000Z"; // stable value → deterministic

function makePreset(input: {
  presetKey: string;
  title: string;
  date: Date;
  category: CalendarCategory;
  note?: string;
}): CalendarEvent {
  const dateStr = isoFromDate(input.date);
  return {
    id: `preset:${input.presetKey}`,
    title: input.title,
    startDate: dateStr,
    allDay: true,
    category: input.category,
    reminderDays: [],
    recurrence: { type: "none" },
    completed: false,
    createdAt: NOW_ISO,
    updatedAt: NOW_ISO,
    source: "steuerstoff",
    informational: true,
    presetKey: input.presetKey,
    note: input.note,
  };
}

// ============================================================
// Tax deadlines
// ============================================================

/** ESt-/KSt-Vorauszahlungen (BY): 10.03., 10.06., 10.09., 10.12. */
const EST_KST_MONTHS = [3, 6, 9, 12] as const;
/** Gewerbesteuer-Vorauszahlungen: 15.02., 15.05., 15.08., 15.11. */
const GEWST_MONTHS = [2, 5, 8, 11] as const;

/** Steuererklärungsfristen — offiziell (Bay. Finanzverwaltung). */
const FILING_DEADLINES: {
  presetKey: string;
  title: string;
  date: string;
}[] = [
  {
    presetKey: "filing:vz2024:beraten",
    title: "Steuererklärung 2024 – mit steuerlicher Beratung",
    date: "2026-04-30",
  },
  {
    presetKey: "filing:vz2025:unberaten",
    title: "Steuererklärung 2025 – ohne steuerliche Beratung",
    date: "2026-07-31",
  },
  {
    presetKey: "filing:vz2025:beraten",
    title: "Steuererklärung 2025 – mit steuerlicher Beratung",
    date: "2027-03-01",
  },
];

function buildForYear(
  year: number,
  s: PresetSettings,
  holidays: Set<string>,
): CalendarEvent[] {
  const list: CalendarEvent[] = [];

  if (s.showHolidays) {
    for (const h of computeHolidays(year, s.bundesland)) {
      list.push(
        makePreset({
          presetKey: `holiday:${s.bundesland}:${h.date}`,
          title: h.title,
          date: new Date(h.date),
          category: "holiday",
          note: `Gesetzlicher Feiertag (${s.bundesland === "BY" ? "Bayern" : "bundesweit"}).`,
        }),
      );
    }
  }

  const shiftNote = (label: string, orig: Date, shifted: Date): string => {
    const o = isoFromDate(orig);
    const n = isoFromDate(shifted);
    if (o === n) {
      return `${label}. Gesetzliche Standardfrist. Individuelle Bescheide können abweichen.`;
    }
    return `${label}. Ursprüngliches Datum ${o} fiel auf Wochenende/Feiertag und wurde auf den nächsten Werktag ${n} verschoben (§ 108 Abs. 3 AO).`;
  };

  if (s.showEStKStVZ) {
    for (const m of EST_KST_MONTHS) {
      const raw = new Date(year, m - 1, 10);
      const { date, shifted } = shiftToNextBusinessDay(raw, holidays);
      list.push(
        makePreset({
          presetKey: `estkst-vz:${year}-${pad(m)}`,
          title: "ESt-/KSt-Vorauszahlung",
          date,
          category: "tax",
          note: shiftNote(
            "Vorauszahlung Einkommen-/Körperschaftsteuer",
            raw,
            shifted ? date : raw,
          ),
        }),
      );
    }
  }

  if (s.showGewStVZ) {
    for (const m of GEWST_MONTHS) {
      const raw = new Date(year, m - 1, 15);
      const { date, shifted } = shiftToNextBusinessDay(raw, holidays);
      list.push(
        makePreset({
          presetKey: `gewst-vz:${year}-${pad(m)}`,
          title: "Gewerbesteuer-Vorauszahlung",
          date,
          category: "tax",
          note: shiftNote(
            "Vorauszahlung Gewerbesteuer",
            raw,
            shifted ? date : raw,
          ),
        }),
      );
    }
  }

  if (s.showMonthlyUStLSt) {
    for (let m = 1; m <= 12; m++) {
      const raw = new Date(year, m - 1, 10);
      const { date, shifted } = shiftToNextBusinessDay(raw, holidays);
      list.push(
        makePreset({
          presetKey: `ust-va:${year}-${pad(m)}`,
          title: "USt-Voranmeldung (Monatszahler)",
          date,
          category: "tax",
          note: shiftNote(
            "Umsatzsteuer-Voranmeldung Monatszahler (Voranmeldungszeitraum: Vormonat)",
            raw,
            shifted ? date : raw,
          ),
        }),
      );
      list.push(
        makePreset({
          presetKey: `lst-anm:${year}-${pad(m)}`,
          title: "Lohnsteuer-Anmeldung (Monatszahler)",
          date,
          category: "tax",
          note: shiftNote(
            "Lohnsteuer-Anmeldung Monatszahler (Anmeldungszeitraum: Vormonat)",
            raw,
            shifted ? date : raw,
          ),
        }),
      );
    }
  }

  return list;
}

/**
 * Build all preset events for the current and following calendar year,
 * plus the officially fixed filing deadlines.
 */
export function buildStandardEvents(s: PresetSettings): CalendarEvent[] {
  const now = new Date();
  const y0 = now.getFullYear();
  const years = [y0, y0 + 1];

  const events: CalendarEvent[] = [];

  for (const y of years) {
    const hSet = holidaySet(y, s.bundesland);
    events.push(...buildForYear(y, s, hSet));
  }

  if (s.showFilingDeadlines) {
    for (const f of FILING_DEADLINES) {
      // shift filing deadlines too, using holidays for the year of the deadline
      const y = Number(f.date.slice(0, 4));
      const hSet = holidaySet(y, s.bundesland);
      const raw = new Date(f.date);
      const { date, shifted } = shiftToNextBusinessDay(raw, hSet);
      const shownDate = shifted ? date : raw;
      events.push(
        makePreset({
          presetKey: f.presetKey,
          title: f.title,
          date: shownDate,
          category: "tax",
          note:
            shifted
              ? `Steuererklärungsfrist (Bayerische Finanzverwaltung). Ursprüngliches Datum ${f.date} wurde auf den nächsten Werktag ${isoFromDate(date)} verschoben (§ 108 Abs. 3 AO).`
              : `Steuererklärungsfrist (Bayerische Finanzverwaltung). Individuelle Bescheide, Dauerfristverlängerungen und Sonderfälle können abweichen.`,
        }),
      );
    }
  }

  // Dedupe by presetKey (safety)
  const seen = new Set<string>();
  return events.filter((e) => {
    const k = e.presetKey ?? e.id;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** True if the event is an integrated steuerstoff preset (read-only). */
export function isPresetEvent(e: CalendarEvent): boolean {
  return e.source === "steuerstoff" || e.informational === true;
}
