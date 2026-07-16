import { ChevronLeft, ChevronRight, CalendarDays, Plus, Sparkles } from "lucide-react";
import type { CalendarView } from "@/lib/calendar-types";

interface CalendarHeaderProps {
  view: CalendarView;
  currentDate: Date;
  onViewChange: (view: CalendarView) => void;
  onNavigate: (direction: -1 | 1) => void;
  onToday: () => void;
  onBreadcrumbClick: (target: "year" | "month" | "week") => void;
  breadcrumb: string;
  title: string;
  onAdd: () => void;
}

export function CalendarHeader({
  view,
  currentDate,
  onViewChange,
  onNavigate,
  onToday,
  onBreadcrumbClick,
  breadcrumb,
  title,
  onAdd,
}: CalendarHeaderProps) {
  const views: Array<{ id: CalendarView; label: string }> = [
    { id: "year", label: "Jahr" },
    { id: "month", label: "Monat" },
    { id: "week", label: "Woche" },
    { id: "agenda", label: "Agenda" },
  ];

  return (
    <div className="rounded-[1.6rem] border border-border/70 bg-card/90 p-4 shadow-card-soft sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Fristenkalender
          </div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <button type="button" onClick={() => onBreadcrumbClick("year")} className="rounded-full border border-border px-2 py-1 transition hover:bg-accent">
              2026
            </button>
            {breadcrumb ? (
              <>
                <span>›</span>
                <span className="rounded-full border border-border px-2 py-1">{breadcrumb}</span>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => onToday()} className="rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground">
            Heute
          </button>
          <button type="button" onClick={() => onNavigate(-1)} className="rounded-full border border-border bg-background p-2 text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onNavigate(1)} className="rounded-full border border-border bg-background p-2 text-foreground">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-2 text-sm text-background">
            <Plus className="h-4 w-4" />
            Termin
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {views.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onViewChange(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${view === item.id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        <span>Responsive, lokal gespeichert und für Mobile optimiert.</span>
      </div>
    </div>
  );
}
