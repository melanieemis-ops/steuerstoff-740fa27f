import { AlertCircle, CalendarClock } from "lucide-react";
import { formatDateLabel, getDaysUntil, getEventCategoryColor, getEventCategoryLabel } from "@/lib/calendar-utils";
import type { CalendarEvent } from "@/lib/calendar-types";

interface UpcomingDeadlinesProps {
  events: CalendarEvent[];
}

export function UpcomingDeadlines({ events }: UpcomingDeadlinesProps) {
  const upcoming = events.filter((event) => !event.completed).slice(0, 4);

  if (!upcoming.length) {
    return null;
  }

  return (
    <div className="rounded-[1.4rem] border border-border/70 bg-card/85 p-4 shadow-card-soft">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">Nächste Fristen</h3>
      </div>

      <div className="mt-3 space-y-2">
        {upcoming.map((event) => {
          const days = getDaysUntil(event.startDate);
          return (
            <div key={event.id} className="rounded-2xl border border-border/60 bg-background/70 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateLabel(event.startDate)}</p>
                </div>
                <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.16em] ${getEventCategoryColor(event.category)}`}>
                  {getEventCategoryLabel(event.category)}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{days < 0 ? `${Math.abs(days)} Tage überfällig` : days === 0 ? "Heute" : `Noch ${days} Tage`}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
