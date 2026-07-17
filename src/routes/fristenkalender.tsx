import { createFileRoute } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Filter,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Clock,
  X,
  StickyNote,
} from "lucide-react";

import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  CalendarEvent,
  CalendarView,
  CalendarCategory,
  RecurrenceType,
} from "@/lib/calendar-types";
import { CATEGORY_META, DONE_COLOR, OVERDUE_COLOR } from "@/lib/calendar-types";
import {
  DE_LOCALE,
  MONTH_LONG,
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  daysUntilDate,
  fmtDE,
  isoWeek,
  monthCount,
  monthMatrix,
  occurrencesInRange,
  occurrencesOnDay,
  overdueOccurrences,
  parseDate,
  thisWeekCount,
  today,
  todaysOccurrences,
  toISODate,
  upcomingNext,
  weekDays,
} from "@/lib/calendar-utils";
import {
  deleteEvent as storageDelete,
  loadEvents,
  newId,
  subscribe,
  upsertEvent,
} from "@/lib/calendar-storage";
import {
  getDayNoteByDate,
  getDayNoteDateSet,
  saveDayNote,
  deleteDayNote,
  subscribeDayNotes,
} from "@/lib/calendar-notes-storage";
import { downloadIcs } from "@/lib/create-ics";
import {
  BUNDESLAND_OPTIONS,
  buildStandardEvents,
  isPresetEvent,
  loadPresetSettings,
  savePresetSettings,
  subscribePresetSettings,
  type PresetSettings,
} from "@/lib/calendar-standard-events";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/fristenkalender")({
  component: FristenkalenderPage,
  head: () => ({
    meta: [
      { title: "Fristenkalender — steuerstoff" },
      {
        name: "description",
        content:
          "Alle Steuerfristen, Prüfungen, Mandanten- und Kanzleitermine im Blick. Jahres-, Monats-, Wochen- und Agenda-Ansicht mit .ics-Export.",
      },
    ],
  }),
});

// ============================================================
// Templates
// ============================================================

type Template = {
  key: string;
  title: string;
  category: CalendarCategory;
  reminderDays: number[];
  recurrence?: { type: RecurrenceType; interval?: number };
  note?: string;
};

const TEMPLATES: Template[] = [
  {
    key: "ust-va",
    title: "Umsatzsteuer-Voranmeldung",
    category: "tax",
    reminderDays: [7, 1],
    recurrence: { type: "monthly", interval: 1 },
  },
  {
    key: "lst-anm",
    title: "Lohnsteuer-Anmeldung",
    category: "tax",
    reminderDays: [7, 1],
    recurrence: { type: "monthly", interval: 1 },
  },
  {
    key: "est-vz",
    title: "Einkommensteuer-Vorauszahlung",
    category: "tax",
    reminderDays: [14, 3],
    recurrence: { type: "yearly", interval: 1 },
  },
  {
    key: "kst-vz",
    title: "Körperschaftsteuer-Vorauszahlung",
    category: "tax",
    reminderDays: [14, 3],
    recurrence: { type: "yearly", interval: 1 },
  },
  {
    key: "gew-vz",
    title: "Gewerbesteuer-Vorauszahlung",
    category: "tax",
    reminderDays: [14, 3],
    recurrence: { type: "yearly", interval: 1 },
  },
  {
    key: "abgabe",
    title: "Abgabefrist",
    category: "tax",
    reminderDays: [14, 3],
  },
  {
    key: "einspruch",
    title: "Einspruchsfrist",
    category: "tax",
    reminderDays: [7, 1],
    note: "Hinweis: Die automatische Berechnung steuerlicher Fristen folgt in einer späteren Version. Bitte prüfen Sie den Fristablauf eigenständig.",
  },
  {
    key: "pruefung",
    title: "Steuerfachwirt-Prüfung",
    category: "exam",
    reminderDays: [14, 7, 1],
  },
  {
    key: "fortbildung",
    title: "Fortbildung",
    category: "learning",
    reminderDays: [3, 1],
  },
];

// ============================================================
// Root component
// ============================================================

function FristenkalenderPage() {
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>(() => loadEvents());
  const [presetSettings, setPresetSettings] = useState<PresetSettings>(() =>
    loadPresetSettings(),
  );
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState<Date>(() => today());
  const [editing, setEditing] = useState<CalendarEvent | "new" | null>(null);
  const [detailsEvent, setDetailsEvent] = useState<CalendarEvent | null>(null);
  const [prefillDate, setPrefillDate] = useState<Date | null>(null);
  const [agendaFilter, setAgendaFilter] = useState<string>("all");
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const [dayPanelDate, setDayPanelDate] = useState<Date | null>(null);
  const [noteDates, setNoteDates] = useState<Set<string>>(() => getDayNoteDateSet());
  const [toast, setToast] = useState<string | null>(null);
  const dayAnchorRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const unsub = subscribe(() => setUserEvents(loadEvents()));
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeDayNotes(() => setNoteDates(getDayNoteDateSet()));
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribePresetSettings(() => setPresetSettings(loadPresetSettings()));
    return unsub;
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const presetEvents = useMemo(
    () => buildStandardEvents(presetSettings),
    [presetSettings],
  );
  const events = useMemo<CalendarEvent[]>(
    () => [...userEvents, ...presetEvents],
    [userEvents, presetEvents],
  );

  const overdue = useMemo(() => overdueOccurrences(events), [events]);
  const todays = useMemo(() => todaysOccurrences(events), [events]);
  const thisWeek = useMemo(() => thisWeekCount(events), [events]);
  const nextUp = useMemo(() => upcomingNext(events, 1)[0], [events]);

  const openNew = useCallback((date?: Date) => {
    setPrefillDate(date ?? null);
    setEditing("new");
  }, []);

  const openEdit = useCallback((e: CalendarEvent) => {
    if (isPresetEvent(e)) return;
    setEditing(e);
    setDetailsEvent(null);
  }, []);

  const openDetails = useCallback((e: CalendarEvent) => {
    setDetailsEvent(e);
  }, []);

  const handleSave = useCallback(
    (e: CalendarEvent) => {
      upsertEvent(e);
      setEditing(null);
    },
    [],
  );

  const handleDelete = useCallback((id: string) => {
    if (typeof window !== "undefined" && !window.confirm("Termin wirklich löschen?")) {
      return;
    }
    storageDelete(id);
    setDetailsEvent(null);
    setEditing(null);
  }, []);

  const toggleComplete = useCallback(
    (e: CalendarEvent) => {
      if (isPresetEvent(e)) return;
      const now = new Date().toISOString();
      upsertEvent({ ...e, completed: !e.completed, updatedAt: now });
    },
    [],
  );

  const duplicate = useCallback((e: CalendarEvent) => {
    const now = new Date().toISOString();
    upsertEvent({
      ...e,
      id: newId(),
      title: `${e.title} (Kopie)`,
      completed: false,
      source: "user",
      informational: false,
      presetKey: undefined,
      createdAt: now,
      updatedAt: now,
    });
    setDetailsEvent(null);
    setToast("Als eigener Termin übernommen");
  }, []);

  // Swipe for month/week
  const swipeRef = useRef<HTMLDivElement | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse") return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const s = swipeStart.current;
    swipeStart.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < 60 || Math.abs(dy) > 60) return;
    if (view === "month") {
      setCursor((c) => addMonths(c, dx < 0 ? 1 : -1));
    } else if (view === "week") {
      setCursor((c) => addWeeks(c, dx < 0 ? 1 : -1));
    }
  };

  const goPrev = () => {
    if (view === "year") setCursor((c) => addYears(c, -1));
    else if (view === "month") setCursor((c) => addMonths(c, -1));
    else if (view === "week") setCursor((c) => addWeeks(c, -1));
    else setCursor((c) => addMonths(c, -1));
  };
  const goNext = () => {
    if (view === "year") setCursor((c) => addYears(c, 1));
    else if (view === "month") setCursor((c) => addMonths(c, 1));
    else if (view === "week") setCursor((c) => addWeeks(c, 1));
    else setCursor((c) => addMonths(c, 1));
  };

  const rangeLabel = useMemo(() => {
    if (view === "year") return String(cursor.getFullYear());
    if (view === "month")
      return `${MONTH_LONG[cursor.getMonth()]} ${cursor.getFullYear()}`;
    if (view === "week")
      return `KW ${isoWeek(cursor)} · ${MONTH_LONG[cursor.getMonth()]} ${cursor.getFullYear()}`;
    return "Agenda";
  }, [cursor, view]);

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-clip">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
            <div className="max-w-3xl">
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
                <span
                  className="text-gradient-brand"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, var(--cyan), var(--violet) 50%, var(--magenta))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Fristen im Blick.
                </span>{" "}
                <span className="text-foreground">
                  Sicher durch den Steueralltag.
                </span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Jahres-, Monats-, Wochen- und Agendaansicht mit Erinnerungen,
                Wiederholungen und .ics-Export.
              </p>
            </div>

            {/* Status cards */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-4 sm:gap-3">
              <StatusCard
                label="Nächste Frist"
                title={nextUp?.event.title ?? "Keine offene Frist"}
                sub={
                  nextUp
                    ? `${fmtDE(nextUp.date)} · ${describeDelta(daysUntilDate(nextUp.date))}`
                    : "—"
                }
                accent="var(--gradient-accent)"
              />
              <StatusCard
                label="Heute"
                title={`${todays.length} Termin${todays.length === 1 ? "" : "e"}`}
                sub={todays[0]?.event.title ?? "Nichts geplant"}
                accent="var(--cyan)"
              />
              <StatusCard
                label="Diese Woche"
                title={`${thisWeek} Termin${thisWeek === 1 ? "" : "e"}`}
                sub={`KW ${isoWeek(today())}`}
                accent="var(--violet)"
              />
              <StatusCard
                label="Überfällig"
                title={`${overdue.length} offen`}
                sub={overdue[0]?.event.title ?? "Alles im grünen Bereich"}
                accent={OVERDUE_COLOR}
                warn={overdue.length > 0}
              />
            </div>
          </div>
        </section>

        {/* Toolbar */}
        <section className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-full border border-border bg-card p-0.5"
              role="tablist"
              aria-label="Ansicht wechseln"
            >
              {(["year", "month", "week", "agenda"] as const).map((v) => {
                const label =
                  v === "year"
                    ? "Jahr"
                    : v === "month"
                      ? "Monat"
                      : v === "week"
                        ? "Woche"
                        : "Agenda";
                const active = view === v;
                return (
                  <button
                    key={v}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setView(v)}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs sm:text-sm transition-colors",
                      active
                        ? "neon-active text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={goPrev}
                aria-label="Zurück"
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[9rem] text-center text-sm font-medium tabular-nums">
                {rangeLabel}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={goNext}
                aria-label="Weiter"
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCursor(today())}
                className="h-9"
              >
                Heute
              </Button>
              <PresetSettingsPopover
                settings={presetSettings}
                onChange={(s) => {
                  savePresetSettings(s);
                  setPresetSettings(s);
                }}
              />
            </div>
          </div>

          {/* Breadcrumbs */}
          <nav className="mt-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <button
              type="button"
              className="hover:text-foreground"
              onClick={() => setView("year")}
            >
              {cursor.getFullYear()}
            </button>
            {(view === "month" || view === "week") && (
              <>
                <span className="mx-1">›</span>
                <button
                  type="button"
                  className="hover:text-foreground"
                  onClick={() => setView("month")}
                >
                  {MONTH_LONG[cursor.getMonth()]}
                </button>
              </>
            )}
            {view === "week" && (
              <>
                <span className="mx-1">›</span>
                <span className="text-foreground">KW {isoWeek(cursor)}</span>
              </>
            )}
          </nav>
        </section>

        {/* Main calendar container with neon border */}
        <section className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
          <div
            ref={swipeRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            className="neon-border neon-glow relative rounded-2xl bg-card p-3 sm:p-5"
          >
            {view === "year" && (
              <YearView
                year={cursor.getFullYear()}
                events={events}
                onOpenMonth={(m) => {
                  setCursor(new Date(cursor.getFullYear(), m, 1));
                  setView("month");
                }}
              />
            )}
            {view === "month" && (
              <MonthView
                cursor={cursor}
                events={events}
                noteDates={noteDates}
                onOpenDay={(d, el) => {
                  dayAnchorRef.current = el ?? null;
                  setDayPanelDate(d);
                }}
                onOpenEvent={openDetails}
                onLongPressDay={(d) => openNew(d)}
              />
            )}
            {view === "week" && (
              <WeekView
                cursor={cursor}
                events={events}
                noteDates={noteDates}
                onOpenDay={(d, el) => {
                  dayAnchorRef.current = el ?? null;
                  setDayPanelDate(d);
                }}
                onOpenEvent={openDetails}
              />
            )}
            {view === "agenda" && (
              <AgendaView
                events={events}
                filter={agendaFilter}
                setFilter={setAgendaFilter}
                hideCompleted={hideCompleted}
                setHideCompleted={setHideCompleted}
                onOpenEvent={openDetails}
                noteDates={noteDates}
                onOpenDay={(d) => setDayPanelDate(d)}
              />
            )}
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Floating add button */}
      <button
        type="button"
        aria-label="Neuen Termin anlegen"
        onClick={() => openNew()}
        className="neon-glow fixed bottom-20 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-lg transition-transform hover:scale-105 md:bottom-8 md:right-8"
        style={{ background: "var(--gradient-accent)" }}
      >
        <Plus className="h-6 w-6" aria-hidden="true" />
      </button>

      {editing && (
        <EventDialog
          initial={editing === "new" ? null : editing}
          prefillDate={prefillDate}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
          onDelete={editing !== "new" ? () => handleDelete(editing.id) : undefined}
        />
      )}

      {detailsEvent && (
        <EventDetailsDialog
          event={detailsEvent}
          onClose={() => setDetailsEvent(null)}
          onEdit={() => openEdit(detailsEvent)}
          onDelete={() => handleDelete(detailsEvent.id)}
          onToggleComplete={() => toggleComplete(detailsEvent)}
          onDuplicate={() => duplicate(detailsEvent)}
        />
      )}

      {dayPanelDate && (
        <DayNotePanel
          date={dayPanelDate}
          onClose={() => setDayPanelDate(null)}
          onOpenWeek={(d) => {
            setCursor(d);
            setView("week");
            setDayPanelDate(null);
          }}
          onAddEvent={(d) => {
            setDayPanelDate(null);
            openNew(d);
          }}
          onNotify={(msg) => setToast(msg)}
        />
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4 md:bottom-10"
        >
          <div className="pointer-events-auto rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Small helpers / components
// ============================================================

function describeDelta(days: number): string {
  if (days === 0) return "Heute";
  if (days === 1) return "Morgen";
  if (days > 0) return `Noch ${days} Tag${days === 1 ? "" : "e"}`;
  return `${-days} Tag${days === -1 ? "" : "e"} überfällig`;
}

function StatusCard({
  label,
  title,
  sub,
  accent,
  warn,
}: {
  label: string;
  title: string;
  sub: string;
  accent: string;
  warn?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl border bg-card p-3 sm:p-4 shadow-card-soft",
        warn ? "border-transparent neon-active" : "border-border",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 shrink-0 rounded-full"
          style={{ background: accent }}
          aria-hidden="true"
        />
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-foreground sm:text-base">
        {title}
      </p>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function CategoryDot({ category, className }: { category: CalendarCategory; className?: string }) {
  return (
    <span
      className={["inline-block h-1.5 w-1.5 rounded-full", className ?? ""].join(" ")}
      style={{ background: CATEGORY_META[category].dot }}
      aria-hidden="true"
    />
  );
}

// ============================================================
// Year view
// ============================================================

function YearView({
  year,
  events,
  onOpenMonth,
}: {
  year: number;
  events: CalendarEvent[];
  onOpenMonth: (monthIndex: number) => void;
}) {
  return (
    <div>
      <h2 className="mb-4 text-center font-serif text-3xl tracking-tight sm:text-5xl">
        {year}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, m) => (
          <MiniMonth
            key={m}
            year={year}
            month={m}
            events={events}
            onOpen={() => onOpenMonth(m)}
          />
        ))}
      </div>
    </div>
  );
}

function MiniMonth({
  year,
  month,
  events,
  onOpen,
}: {
  year: number;
  month: number;
  events: CalendarEvent[];
  onOpen: () => void;
}) {
  const days = monthMatrix(year, month);
  const first = startOfMonth(new Date(year, month, 1));
  const last = endOfMonth(first);
  const monthOccurrences = useMemo(
    () => occurrencesInRange(events, first, last),
    [events, first, last],
  );
  const openCount = monthCount(events, year, month);
  const overdueInMonth = monthOccurrences.filter(
    (o) => !o.event.completed && o.date < today(),
  ).length;

  const byDay = useMemo(() => {
    const map = new Map<string, { hasTax: boolean; hasOther: boolean; overdue: boolean }>();
    for (const o of monthOccurrences) {
      const key = toISODate(o.date);
      const prev = map.get(key) ?? { hasTax: false, hasOther: false, overdue: false };
      if (o.event.category === "tax") prev.hasTax = true;
      else prev.hasOther = true;
      if (!o.event.completed && o.date < today()) prev.overdue = true;
      map.set(key, prev);
    }
    return map;
  }, [monthOccurrences]);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="neon-hover flex flex-col rounded-xl border border-border bg-background p-2 text-left transition-colors sm:p-3"
    >
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-serif text-sm font-medium sm:text-base">
          {MONTH_LONG[month]}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {openCount > 0 ? `${openCount} offen` : "—"}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-[9px] text-muted-foreground">
        {WEEKDAY_SHORT.map((w) => (
          <span key={w} className="text-center">
            {w[0]}
          </span>
        ))}
        {days.map((d) => {
          const inMonth = isSameMonth(d, first);
          const key = toISODate(d);
          const info = byDay.get(key);
          const isCur = isToday(d);
          return (
            <span
              key={key}
              className={[
                "relative flex aspect-square items-center justify-center rounded text-[9px] sm:text-[10px]",
                inMonth ? "text-foreground" : "text-muted-foreground/40",
                isCur ? "bg-foreground/10 font-semibold" : "",
              ].join(" ")}
            >
              {d.getDate()}
              {info && (
                <span
                  className="absolute bottom-0.5 h-0.5 w-0.5 rounded-full"
                  style={{
                    background: info.overdue
                      ? OVERDUE_COLOR
                      : info.hasTax
                        ? CATEGORY_META.tax.dot
                        : "var(--cyan)",
                  }}
                />
              )}
            </span>
          );
        })}
      </div>
      {overdueInMonth > 0 && (
        <span
          className="mt-1 self-start rounded-full px-1.5 py-0.5 text-[9px] text-white"
          style={{ background: OVERDUE_COLOR }}
        >
          {overdueInMonth} überfällig
        </span>
      )}
    </button>
  );
}

// ============================================================
// Month view
// ============================================================

function MonthView({
  cursor,
  events,
  noteDates,
  onOpenDay,
  onOpenEvent,
  onLongPressDay,
}: {
  cursor: Date;
  events: CalendarEvent[];
  noteDates: Set<string>;
  onOpenDay: (d: Date, el?: HTMLElement | null) => void;
  onOpenEvent: (e: CalendarEvent) => void;
  onLongPressDay: (d: Date) => void;
}) {
  const days = monthMatrix(cursor.getFullYear(), cursor.getMonth());
  const first = startOfMonth(cursor);
  const last = endOfMonth(first);
  const occs = useMemo(
    () => occurrencesInRange(events, days[0], days[days.length - 1]),
    [events, days],
  );
  const byDay = useMemo(() => {
    const map = new Map<string, { date: Date; event: CalendarEvent }[]>();
    for (const o of occs) {
      const k = toISODate(o.date);
      const arr = map.get(k) ?? [];
      arr.push(o);
      map.set(k, arr);
    }
    return map;
  }, [occs]);

  const pressTimer = useRef<number | null>(null);
  const pressed = useRef<string | null>(null);

  const startPress = (d: Date) => {
    pressed.current = toISODate(d);
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => {
      onLongPressDay(d);
      pressed.current = null;
    }, 550);
  };
  const cancelPress = () => {
    if (pressTimer.current) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground sm:text-xs">
        {WEEKDAY_SHORT.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const key = toISODate(d);
          const list = byDay.get(key) ?? [];
          const inMonth = isSameMonth(d, first);
          const isCur = isToday(d);
          const maxShow = 2;
          return (
            <div
              key={key}
              onPointerDown={() => startPress(d)}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              onPointerCancel={cancelPress}
              className={[
                "min-h-[64px] rounded-lg border p-1 text-left sm:min-h-[92px] sm:p-1.5",
                inMonth
                  ? "border-border bg-background"
                  : "border-transparent bg-muted/30 text-muted-foreground/50",
                isCur ? "neon-active" : "",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={(ev) => onOpenDay(d, ev.currentTarget)}
                aria-label={`Tagesnotiz für ${fmtDE(d)} öffnen`}
                className="mb-0.5 flex w-full items-center justify-between text-[11px] sm:text-xs"
              >
                <span className={isCur ? "font-semibold" : ""}>{d.getDate()}</span>
                <span className="flex items-center gap-0.5">
                  {noteDates.has(key) && (
                    <StickyNote
                      className="h-2.5 w-2.5"
                      style={{ color: "var(--magenta, oklch(0.7 0.18 340))" }}
                      aria-label="Tagesnotiz vorhanden"
                    />
                  )}
                  {list.length > 0 && (
                    <span className="flex gap-0.5">
                      {list.slice(0, 3).map((o, i) => (
                        <CategoryDot key={i} category={o.event.category} />
                      ))}
                    </span>
                  )}
                </span>
              </button>
              <div className="flex flex-col gap-0.5">
                {list.slice(0, maxShow).map((o, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onOpenEvent(o.event)}
                    className="truncate rounded px-1 text-left text-[10px] leading-tight sm:text-[11px]"
                    style={{
                      background: `color-mix(in oklab, ${CATEGORY_META[o.event.category].color} 18%, transparent)`,
                      color: o.event.completed
                        ? "var(--muted-foreground)"
                        : "var(--foreground)",
                      textDecoration: o.event.completed ? "line-through" : "none",
                    }}
                    title={o.event.title}
                  >
                    {o.event.title}
                  </button>
                ))}
                {list.length > maxShow && (
                  <button
                    type="button"
                    onClick={() => onOpenDay(d)}
                    className="text-left text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    + {list.length - maxShow} weitere
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Week view
// ============================================================

function WeekView({
  cursor,
  events,
  noteDates,
  onOpenEvent,
  onOpenDay,
}: {
  cursor: Date;
  events: CalendarEvent[];
  noteDates: Set<string>;
  onOpenEvent: (e: CalendarEvent) => void;
  onOpenDay: (d: Date, el?: HTMLElement | null) => void;
}) {
  const days = weekDays(cursor);
  const from = startOfWeek(cursor, DE_LOCALE);
  const to = endOfWeek(cursor, DE_LOCALE);
  const occs = useMemo(() => occurrencesInRange(events, from, to), [events, from, to]);
  const byDay = useMemo(() => {
    const m = new Map<string, { date: Date; event: CalendarEvent }[]>();
    for (const o of occs) {
      const k = toISODate(o.date);
      const arr = m.get(k) ?? [];
      arr.push(o);
      m.set(k, arr);
    }
    return m;
  }, [occs]);

  return (
    <div className="flex flex-col gap-2">
      {days.map((d, i) => {
        const key = toISODate(d);
        const list = byDay.get(key) ?? [];
        const isCur = isToday(d);
        const hasNote = noteDates.has(key);
        return (
          <div
            key={i}
            className={[
              "rounded-xl border p-3",
              isCur ? "neon-active border-transparent" : "border-border bg-background",
            ].join(" ")}
          >
            <button
              type="button"
              onClick={(ev) => onOpenDay(d, ev.currentTarget)}
              aria-label={`Tagesnotiz für ${fmtDE(d)} öffnen`}
              className="mb-2 flex w-full items-baseline justify-between text-left"
            >
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {WEEKDAY_LONG[i]}
                </p>
                <p className="font-serif text-lg">{fmtDE(d, "dd.MM.")}</p>
              </div>
              <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                {hasNote && (
                  <StickyNote
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--magenta, oklch(0.7 0.18 340))" }}
                    aria-label="Tagesnotiz vorhanden"
                  />
                )}
                {list.length} Termin{list.length === 1 ? "" : "e"}
              </span>
            </button>
            {list.length === 0 ? (
              <p className="text-xs text-muted-foreground">Keine Termine.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {list.map((o, k) => (
                  <li key={k}>
                    <button
                      type="button"
                      onClick={() => onOpenEvent(o.event)}
                      className="neon-hover flex w-full items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-left text-sm"
                    >
                      <CategoryDot category={o.event.category} className="h-2 w-2" />
                      <span
                        className="flex-1 truncate"
                        style={{
                          textDecoration: o.event.completed ? "line-through" : "none",
                          color: o.event.completed
                            ? "var(--muted-foreground)"
                            : undefined,
                        }}
                      >
                        {o.event.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {o.event.allDay
                          ? "Ganztägig"
                          : (o.event.startTime ?? "")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Agenda view
// ============================================================

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "tax", label: "Steuerfristen" },
  { key: "exam", label: "Prüfung" },
  { key: "learning", label: "Lernen" },
  { key: "client", label: "Mandant" },
  { key: "office", label: "Kanzlei" },
  { key: "personal", label: "Persönlich" },
  { key: "done", label: "Erledigt" },
  { key: "overdue", label: "Überfällig" },
];

function AgendaView({
  events,
  filter,
  setFilter,
  hideCompleted,
  setHideCompleted,
  onOpenEvent,
  noteDates: _noteDates,
  onOpenDay: _onOpenDay,
}: {
  events: CalendarEvent[];
  filter: string;
  setFilter: (f: string) => void;
  hideCompleted: boolean;
  setHideCompleted: (b: boolean) => void;
  onOpenEvent: (e: CalendarEvent) => void;
  noteDates: Set<string>;
  onOpenDay: (d: Date) => void;
}) {
  const from = addYears(today(), -1);
  const to = addYears(today(), 2);
  const all = useMemo(() => occurrencesInRange(events, from, to), [events, from, to]);

  const filtered = all.filter((o) => {
    if (hideCompleted && o.event.completed) return false;
    if (filter === "all") return true;
    if (filter === "done") return o.event.completed;
    if (filter === "overdue") return !o.event.completed && o.date < today();
    return o.event.category === filter;
  });

  const groups: Record<string, { date: Date; event: CalendarEvent }[]> = {
    "Überfällig": [],
    "Heute": [],
    "Morgen": [],
    "Diese Woche": [],
    "Später": [],
    "Erledigt": [],
  };
  const t = today();
  const weekEnd = endOfWeek(t, DE_LOCALE);
  for (const o of filtered) {
    if (o.event.completed) groups["Erledigt"].push(o);
    else if (o.date < t) groups["Überfällig"].push(o);
    else if (isSameDay(o.date, t)) groups["Heute"].push(o);
    else if (isSameDay(o.date, addDays(t, 1))) groups["Morgen"].push(o);
    else if (o.date <= weekEnd) groups["Diese Woche"].push(o);
    else groups["Später"].push(o);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={[
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                active
                  ? "neon-active border-transparent text-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {f.label}
            </button>
          );
        })}
        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={hideCompleted} onCheckedChange={setHideCompleted} />
          Erledigte ausblenden
        </label>
      </div>

      {Object.entries(groups).map(([label, list]) =>
        list.length === 0 ? null : (
          <div key={label} className="mb-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </h3>
            <ul className="flex flex-col gap-1.5">
              {list.map((o, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => onOpenEvent(o.event)}
                    className="neon-hover flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left"
                  >
                    <span
                      className="inline-block h-8 w-1 shrink-0 rounded-full"
                      style={{ background: CATEGORY_META[o.event.category].color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        style={{
                          textDecoration: o.event.completed ? "line-through" : "none",
                          color: o.event.completed
                            ? "var(--muted-foreground)"
                            : undefined,
                        }}
                      >
                        {o.event.title}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                        <span>{fmtDE(o.date)}</span>
                        <span>·</span>
                        <span>
                          {o.event.allDay ? "Ganztägig" : (o.event.startTime ?? "—")}
                        </span>
                        <span>·</span>
                        <span>{CATEGORY_META[o.event.category].label}</span>
                        {o.event.client && (
                          <>
                            <span>·</span>
                            <span className="truncate">{o.event.client}</span>
                          </>
                        )}
                        {o.event.recurrence && o.event.recurrence.type !== "none" && (
                          <RotateCcw className="h-3 w-3" aria-label="Wiederkehrend" />
                        )}
                        {(o.event.reminderDays?.length ?? 0) > 0 && (
                          <Clock className="h-3 w-3" aria-label="Erinnerung aktiv" />
                        )}
                      </p>
                    </div>
                    {o.event.completed && (
                      <CheckCircle2
                        className="h-4 w-4 shrink-0"
                        style={{ color: DONE_COLOR }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ),
      )}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Keine Termine gefunden.
        </div>
      )}
    </div>
  );
}

// ============================================================
// Event dialog (create/edit)
// ============================================================

function EventDialog({
  initial,
  prefillDate,
  onSave,
  onCancel,
  onDelete,
}: {
  initial: CalendarEvent | null;
  prefillDate: Date | null;
  onSave: (e: CalendarEvent) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const now = new Date().toISOString();
  const base: CalendarEvent = initial ?? {
    id: newId(),
    title: "",
    startDate: prefillDate ? toISODate(prefillDate) : toISODate(today()),
    allDay: true,
    category: "tax",
    reminderDays: [7, 1],
    recurrence: { type: "none" },
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  const [form, setForm] = useState<CalendarEvent>(base);
  const [reminderChoice, setReminderChoice] = useState<string>(
    reminderKey(base.reminderDays),
  );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      title: form.title.trim(),
      reminderDays: reminderFromKey(reminderChoice, form.reminderDays),
      updatedAt: new Date().toISOString(),
    });
  };

  const applyTemplate = (t: Template) => {
    setForm((f) => ({
      ...f,
      title: t.title,
      category: t.category,
      reminderDays: t.reminderDays,
      recurrence: t.recurrence ?? { type: "none" },
      note: t.note ?? f.note,
    }));
    setReminderChoice(reminderKey(t.reminderDays));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Termin bearbeiten" : "Neuen Termin anlegen"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {!initial && (
            <div>
              <Label className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                Steuertermin übernehmen
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="neon-hover rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="ev-title">Titel *</Label>
            <Input
              id="ev-title"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="ev-start">Datum *</Label>
              <Input
                id="ev-start"
                type="date"
                required
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ev-end">Enddatum</Label>
              <Input
                id="ev-end"
                type="date"
                value={form.endDate ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value || undefined }))
                }
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={form.allDay}
              onCheckedChange={(v) => setForm((f) => ({ ...f, allDay: v }))}
              id="ev-allday"
            />
            <Label htmlFor="ev-allday" className="cursor-pointer">
              Ganztägig
            </Label>
          </div>

          {!form.allDay && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ev-stime">Uhrzeit</Label>
                <Input
                  id="ev-stime"
                  type="time"
                  value={form.startTime ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startTime: e.target.value || undefined }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ev-etime">Endzeit</Label>
                <Input
                  id="ev-etime"
                  type="time"
                  value={form.endTime ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endTime: e.target.value || undefined }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Kategorie</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as CalendarCategory }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_META) as CalendarCategory[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {CATEGORY_META[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Erinnerung</Label>
              <Select value={reminderChoice} onValueChange={setReminderChoice}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Erinnerung</SelectItem>
                  <SelectItem value="0">Am selben Tag</SelectItem>
                  <SelectItem value="1">1 Tag vorher</SelectItem>
                  <SelectItem value="3">3 Tage vorher</SelectItem>
                  <SelectItem value="7">7 Tage vorher</SelectItem>
                  <SelectItem value="14">14 Tage vorher</SelectItem>
                  <SelectItem value="7-1">7 + 1 Tage vorher</SelectItem>
                  <SelectItem value="14-3">14 + 3 Tage vorher</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Wiederholung</Label>
              <Select
                value={form.recurrence?.type ?? "none"}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    recurrence: { ...(f.recurrence ?? {}), type: v as RecurrenceType },
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine</SelectItem>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.recurrence && form.recurrence.type !== "none" && (
              <div>
                <Label htmlFor="ev-until">Wiederholung bis</Label>
                <Input
                  id="ev-until"
                  type="date"
                  value={form.recurrence.until ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      recurrence: {
                        ...(f.recurrence ?? { type: "none" }),
                        until: e.target.value || undefined,
                      },
                    }))
                  }
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="ev-client">Mandant / Bezug</Label>
            <Input
              id="ev-client"
              value={form.client ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, client: e.target.value || undefined }))
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="ev-loc">Ort</Label>
            <Input
              id="ev-loc"
              value={form.location ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value || undefined }))
              }
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="ev-note">Notiz</Label>
            <Textarea
              id="ev-note"
              rows={3}
              value={form.note ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, note: e.target.value || undefined }))
              }
              className="mt-1"
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Löschen
              </Button>
            )}
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
              {initial && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => downloadIcs(initial)}
                >
                  In Apple-/Gerätekalender speichern
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onCancel}>
                Abbrechen
              </Button>
              <Button type="submit">Speichern</Button>
            </div>

          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function reminderKey(days: number[]): string {
  const sorted = [...days].sort((a, b) => b - a);
  if (sorted.length === 0) return "none";
  if (sorted.length === 1) return String(sorted[0]);
  return sorted.join("-");
}
function reminderFromKey(key: string, fallback: number[]): number[] {
  if (key === "none") return [];
  const parts = key.split("-").map((s) => Number(s)).filter((n) => !Number.isNaN(n));
  return parts.length > 0 ? parts : fallback;
}

// ============================================================
// Details dialog
// ============================================================

function EventDetailsDialog({
  event,
  onClose,
  onEdit,
  onDelete,
  onToggleComplete,
  onDuplicate,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onDuplicate: () => void;
}) {
  const start = parseDate(event.startDate);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CategoryDot category={event.category} className="h-2.5 w-2.5" />
            <span>{event.title}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-medium">
              {WEEKDAY_LONG[(start.getDay() + 6) % 7]}, {fmtDE(start)}
            </span>
            <span className="text-muted-foreground">
              {event.allDay
                ? "Ganztägig"
                : `${event.startTime ?? "—"}${event.endTime ? " – " + event.endTime : ""}`}
            </span>
          </div>

          <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5 text-xs">
            <dt className="text-muted-foreground">Kategorie</dt>
            <dd>{CATEGORY_META[event.category].label}</dd>

            {event.client && (
              <>
                <dt className="text-muted-foreground">Mandant</dt>
                <dd>{event.client}</dd>
              </>
            )}
            {event.location && (
              <>
                <dt className="text-muted-foreground">Ort</dt>
                <dd>{event.location}</dd>
              </>
            )}
            {event.reminderDays.length > 0 && (
              <>
                <dt className="text-muted-foreground">Erinnerung</dt>
                <dd>
                  {[...event.reminderDays]
                    .sort((a, b) => b - a)
                    .map((d) => (d === 0 ? "am Tag" : `${d} Tag${d === 1 ? "" : "e"} vorher`))
                    .join(", ")}
                </dd>
              </>
            )}
            {event.recurrence && event.recurrence.type !== "none" && (
              <>
                <dt className="text-muted-foreground">Wiederholung</dt>
                <dd>
                  {(
                    {
                      daily: "täglich",
                      weekly: "wöchentlich",
                      monthly: "monatlich",
                      yearly: "jährlich",
                    } as const
                  )[event.recurrence.type as "daily" | "weekly" | "monthly" | "yearly"]}
                  {event.recurrence.until ? ` bis ${fmtDE(event.recurrence.until)}` : ""}
                </dd>
              </>
            )}
            {event.completed && (
              <>
                <dt className="text-muted-foreground">Status</dt>
                <dd style={{ color: DONE_COLOR }}>Erledigt</dd>
              </>
            )}
          </dl>

          {event.note && (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs whitespace-pre-wrap">
              {event.note}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button variant="outline" size="sm" onClick={onToggleComplete}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            {event.completed ? "Wieder öffnen" : "Erledigt"}
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Bearbeiten
          </Button>
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="mr-1.5 h-4 w-4" />
            Duplizieren
          </Button>
          <Button variant="outline" size="sm" onClick={() => downloadIcs(event)}>
            <Download className="mr-1.5 h-4 w-4" />
            In Gerätekalender
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Löschen
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="mr-1.5 h-4 w-4" />
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// silence unused import for icons used only conditionally
void CalendarDays;

// ============================================================
// Day-Note Panel (Tagesnotiz)
// ============================================================

function DayNotePanel({
  date,
  onClose,
  onOpenWeek,
  onAddEvent,
  onNotify,
}: {
  date: Date;
  onClose: () => void;
  onOpenWeek: (d: Date) => void;
  onAddEvent: (d: Date) => void;
  onNotify: (msg: string) => void;
}) {
  const iso = toISODate(date);
  const existing = getDayNoteByDate(iso);
  const [content, setContent] = useState<string>(existing?.content ?? "");
  const [saving, setSaving] = useState<boolean>(false);
  const initialRef = useRef<string>(existing?.content ?? "");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => textareaRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, []);

  const dirty = content !== initialRef.current;

  const save = () => {
    setSaving(true);
    try {
      const trimmed = content.trim();
      if (trimmed.length === 0) {
        if (existing) deleteDayNote(existing.date);
        onNotify("Tagesnotiz gelöscht");
      } else {
        saveDayNote({ date: iso, content: trimmed });
        onNotify("Tagesnotiz gespeichert");
      }
      initialRef.current = trimmed;
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const remove = () => {
    if (existing) {
      deleteDayNote(existing.date);
      onNotify("Tagesnotiz gelöscht");
    }
    onClose();
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" aria-hidden="true" />
            Tagesnotiz · {fmtDE(date, "EEEE, dd.MM.yyyy")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Was ist an diesem Tag wichtig? (nur Text, wird lokal gespeichert)"
            className="min-h-[160px] w-full min-w-0 max-w-full"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenWeek(date)}
            >
              <CalendarDays className="mr-1.5 h-4 w-4" />
              Woche öffnen
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAddEvent(date)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Termin anlegen
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-wrap gap-2">
          {existing && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={remove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Notiz löschen
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="mr-1.5 h-4 w-4" />
            Schließen
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!dirty || saving}
            onClick={save}
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
