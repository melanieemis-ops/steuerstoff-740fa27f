import { AlertCircle, CheckCircle2, Clock3, Repeat2 } from "lucide-react";
import type { CalendarEvent } from "@/lib/calendar-types";
import { formatDateLabel, formatTimeLabel, getDaysUntil, getEventCategoryColor, getEventCategoryLabel } from "@/lib/calendar-utils";

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
}

export function AgendaView({ events, onEventSelect }: AgendaViewProps) {
  const sorted = [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const sections = [
    { key: "today", label: "Heute", items: sorted.filter((event) => !event.completed && getDaysUntil(event.startDate) === 0) },
    { key: "tomorrow", label: "Morgen", items: sorted.filter((event) => !event.completed && getDaysUntil(event.startDate) === 1) },
    { key: "week", label: "Diese Woche", items: sorted.filter((event) => !event.completed && getDaysUntil(event.startDate) > 1 && getDaysUntil(event.startDate) <= 7) },
    { key: "later", label: "Später", items: sorted.filter((event) => !event.completed && getDaysUntil(event.startDate) > 7) },
    { key: "overdue", label: "Überfällig", items: sorted.filter((event) => !event.completed && getDaysUntil(event.startDate) < 0) },
    { key: "completed", label: "Erledigt", items: sorted.filter((event) => event.completed) },
  ];

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        if (!section.items.length) return null;
        return (
          <div key={section.key} className="rounded-[1.4rem] border border-border/70 bg-card/80 p-3 shadow-card-soft">
            <h3 className="text-sm font-semibold text-foreground">{section.label}</h3>
            <div className="mt-3 space-y-2">
              {section.items.map((event) => (
                <button key={event.id} type="button" onClick={() => onEventSelect(event)} className="flex w-full items-start justify-between rounded-2xl border border-border bg-background/70 p-3 text-left">
                  <div>
                    <div className="text-sm font-medium text-foreground">{event.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{formatDateLabel(event.startDate)} · {formatTimeLabel(event.allDay ? undefined : event.startTime)}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <span className={`rounded-full border px-2 py-0.5 ${getEventCategoryColor(event.category)}`}>{getEventCategoryLabel(event.category)}</span>
                      {event.client ? <span>{event.client}</span> : null}
                      {event.recurrence && event.recurrence.type !== "none" ? <span className="inline-flex items-center gap-1"><Repeat2 className="h-3 w-3" /> wiederkehrend</span> : null}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {event.completed ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock3 className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
