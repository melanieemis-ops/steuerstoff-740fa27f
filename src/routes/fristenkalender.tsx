import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpenText, CalendarDays, ChevronLeft, ChevronRight, Plus, Sparkles } from "lucide-react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { CalendarBreadcrumbs } from "@/components/calendar/CalendarBreadcrumbs";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { AgendaView } from "@/components/calendar/AgendaView";
import { EventDialog } from "@/components/calendar/EventDialog";
import { EventDetails } from "@/components/calendar/EventDetails";
import { MonthView } from "@/components/calendar/MonthView";
import { UpcomingDeadlines } from "@/components/calendar/UpcomingDeadlines";
import { WeekView } from "@/components/calendar/WeekView";
import { YearView } from "@/components/calendar/YearView";
import { CalendarFilters } from "@/components/calendar/CalendarFilters";
import {
  deleteCalendarEvent,
  readCalendarEvents,
  saveCalendarEvents,
  upsertCalendarEvent,
} from "@/lib/calendar-storage";
import type { CalendarAgendaFilter, CalendarEvent, CalendarView } from "@/lib/calendar-types";
import {
  createEmptyEventDate,
  formatDateKey,
  getAlertState,
  getDaysUntil,
  getEventCategoryColor,
  getEventCategoryLabel,
} from "@/lib/calendar-utils";

export const Route = createFileRoute("/fristenkalender")({
  component: FristenkalenderPage,
  head: () => ({ meta: [{ title: "Fristenkalender · steuerstoff" }] }),
});

function FristenkalenderPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 6, 1));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [detailsEvent, setDetailsEvent] = useState<CalendarEvent | undefined>(undefined);
  const [agendaFilter, setAgendaFilter] = useState<CalendarAgendaFilter>("all");
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    setEvents(readCalendarEvents());
  }, []);

  const alertState = useMemo(() => getAlertState(events), [events]);

  const filteredEvents = useMemo(() => {
    let filtered = events.filter((event) => showCompleted || !event.completed);
    if (agendaFilter === "completed") {
      filtered = filtered.filter((event) => event.completed);
    } else if (agendaFilter === "overdue") {
      filtered = filtered.filter((event) => !event.completed && getDaysUntil(event.startDate) < 0);
    } else if (agendaFilter !== "all") {
      filtered = filtered.filter((event) => event.category === agendaFilter);
    }
    return filtered.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, agendaFilter, showCompleted]);

  const breadcrumbs = useMemo(() => {
    const items: string[] = [];
    if (view === "year") {
      items.push(String(currentDate.getFullYear()));
    } else if (view === "month") {
      items.push(String(currentDate.getFullYear()));
      items.push(currentDate.toLocaleDateString("de-DE", { month: "long" }));
    } else if (view === "week") {
      items.push(String(currentDate.getFullYear()));
      items.push(`KW ${Math.ceil(((new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 3).getTime() - new Date(currentDate.getFullYear(), 0, 4).getTime()) / 86400000 + 1) / 7)}`);
    }
    return items;
  }, [currentDate, view]);

  const openCreateDialog = (date?: Date) => {
    setEditingEvent(undefined);
    const startDate = date ? formatDateKey(date) : formatDateKey(selectedDate);
    setSelectedDate(new Date(`${startDate}T12:00:00`));
    setDialogOpen(true);
  };

  const saveEvent = (event: CalendarEvent) => {
    const nextEvents = upsertCalendarEvent(event);
    setEvents(nextEvents);
  };

  const deleteEvent = (id: string) => {
    const nextEvents = deleteCalendarEvent(id);
    setEvents(nextEvents);
    setDetailsOpen(false);
  };

  const toggleComplete = (event: CalendarEvent) => {
    const nextEvent = { ...event, completed: !event.completed, updatedAt: new Date().toISOString() };
    const nextEvents = upsertCalendarEvent(nextEvent);
    setEvents(nextEvents);
    setDetailsOpen(false);
  };

  const duplicateEvent = (event: CalendarEvent) => {
    const copied = { ...event, id: `event-${Date.now()}`, title: `${event.title} (Kopie)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const nextEvents = upsertCalendarEvent(copied);
    setEvents(nextEvents);
    setDetailsOpen(false);
  };

  const navigateDate = (direction: -1 | 1) => {
    if (view === "year") {
      setCurrentDate(new Date(currentDate.getFullYear() + direction, 0, 1));
      return;
    }
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
      return;
    }
    if (view === "week") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7 * direction));
      return;
    }
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + direction));
  };

  const selectDay = (date: Date) => {
    setSelectedDate(date);
    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    if (view === "month") {
      setView("week");
    }
  };

  const selectMonth = (date: Date) => {
    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setSelectedDate(date);
    setView("month");
  };

  const selectYear = (direction: -1 | 1) => {
    setCurrentDate(new Date(currentDate.getFullYear() + direction, 0, 1));
  };

  const renderView = () => {
    if (view === "year") {
      return <YearView year={currentDate.getFullYear()} selectedDate={selectedDate} events={events} onMonthSelect={selectMonth} onYearChange={selectYear} />;
    }
    if (view === "month") {
      return <MonthView currentDate={currentDate} events={events} selectedDate={selectedDate} onDaySelect={selectDay} onEventSelect={(event) => { setDetailsEvent(event); setDetailsOpen(true); }} onLongPress={(date) => openCreateDialog(date)} onSwipe={(direction) => navigateDate(direction)} />;
    }
    if (view === "week") {
      return <WeekView currentDate={selectedDate} events={events} onEventSelect={(event) => { setDetailsEvent(event); setDetailsOpen(true); }} onSwipe={(direction) => navigateDate(direction)} />;
    }
    return <AgendaView events={filteredEvents} onEventSelect={(event) => { setDetailsEvent(event); setDetailsOpen(true); }} />;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 pb-24 md:pb-16">
        <section className="border-b border-border/60 bg-card/40">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" /> Fristen im Blick
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Sicher durch den Steueralltag.
                </h1>
                <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  Steuerfristen, Prüfungen, Lerntermine und Mandantentermine an einem Ort – responsiv, lokal und zuverlässig.
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-border/70 bg-background/80 p-4 shadow-card-soft">
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Nächste Frist", value: alertState.nextEvent?.title ?? "Keine offenen Termine" },
                    { label: "Heute", value: `${alertState.todayCount} offen` },
                    { label: "Diese Woche", value: `${events.filter((event) => !event.completed && getDaysUntil(event.startDate) <= 7).length} offen` },
                    { label: "Überfällig", value: `${alertState.overdueCount} offen` },
                  ].map((item) => (
                    <div key={item.label} className="min-w-[140px] rounded-2xl border border-border/60 bg-card/70 p-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <CalendarHeader
                view={view}
                currentDate={currentDate}
                onViewChange={(nextView) => setView(nextView)}
                onNavigate={navigateDate}
                onToday={() => {
                  const today = new Date();
                  setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelectedDate(today);
                  setView("month");
                }}
                onBreadcrumbClick={(target) => {
                  if (target === "year") {
                    setView("year");
                    setCurrentDate(new Date(currentDate.getFullYear(), 0, 1));
                  }
                }}
                breadcrumb={breadcrumbs[breadcrumbs.length - 1] ?? ""}
                title={view === "year" ? `${currentDate.getFullYear()}` : view === "month" ? currentDate.toLocaleDateString("de-DE", { month: "long", year: "numeric" }) : view === "week" ? `KW ${Math.ceil(((new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 3).getTime() - new Date(currentDate.getFullYear(), 0, 4).getTime()) / 86400000 + 1) / 7)}` : "Agenda"}
                onAdd={() => openCreateDialog(selectedDate)}
              />

              <CalendarBreadcrumbs items={breadcrumbs} onSelect={(index) => { if (index === 0) setView("year"); }} />

              {renderView()}
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.4rem] border border-border/70 bg-card/90 p-4 shadow-card-soft">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Agenda</p>
                    <h3 className="text-lg font-semibold text-foreground">Filter</h3>
                  </div>
                  <button type="button" onClick={() => setShowCompleted((value) => !value)} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                    {showCompleted ? "Erledigte einblenden" : "Erledigte ausblenden"}
                  </button>
                </div>
                <div className="mt-3">
                  <CalendarFilters filter={agendaFilter} onChange={setAgendaFilter} />
                </div>
              </div>
              <UpcomingDeadlines events={events} />
              <div className="rounded-[1.4rem] border border-border/70 bg-card/90 p-4 shadow-card-soft">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4" /> Hinweis
                </div>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Für Einspruchsfristen wird zunächst ein manuell einzugebendes Datum angezeigt. Die automatische Berechnung steuerlicher Fristen folgt in einer späteren Version.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      <button type="button" onClick={() => openCreateDialog(selectedDate)} className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-2xl md:bottom-6 md:right-6">
        <Plus className="h-6 w-6" />
      </button>

      <EventDialog open={dialogOpen} event={editingEvent} selectedDate={formatDateKey(selectedDate)} onClose={() => { setDialogOpen(false); setEditingEvent(undefined); }} onSave={saveEvent} onDelete={deleteEvent} />
      <EventDetails open={detailsOpen} event={detailsEvent} onClose={() => setDetailsOpen(false)} onToggleComplete={toggleComplete} onEdit={(event) => { setEditingEvent(event); setDetailsOpen(false); setDialogOpen(true); }} onDuplicate={duplicateEvent} onDelete={deleteEvent} />
    </div>
  );
}
