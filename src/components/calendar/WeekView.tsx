import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Clock3 } from "lucide-react";
import type { CalendarEvent } from "@/lib/calendar-types";
import { calendarWeekdays, formatDateLabel, formatDateKey, getEventCategoryColor, getEventCategoryLabel } from "@/lib/calendar-utils";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onSwipe: (direction: -1 | 1) => void;
}

export function WeekView({ currentDate, events, onEventSelect, onSwipe }: WeekViewProps) {
  const todayKey = formatDateKey(new Date());
  const start = new Date(currentDate);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-border/70 bg-card/90 p-3 shadow-card-soft" onTouchStart={(event) => {
      const touchStartX = event.touches[0]?.clientX ?? 0;
      const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
      if (touchStartX - touchEndX > 60) onSwipe(1);
      if (touchStartX - touchEndX < -60) onSwipe(-1);
    }}>
      <div className="space-y-3">
        {days.map((day) => {
          const key = formatDateKey(day);
          const dayEvents = events.filter((event) => event.startDate === key || (event.startDate <= key && event.endDate && event.endDate >= key));
          return (
            <div key={key} className="rounded-2xl border border-border/60 bg-background/70 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{calendarWeekdays[(day.getDay() + 6) % 7]}</p>
                  <p className="text-xs text-muted-foreground">{formatDateLabel(day)}</p>
                </div>
                {key === todayKey ? <span className="rounded-full border border-foreground/20 bg-foreground/10 px-2 py-0.5 text-[10px] text-foreground">Heute</span> : null}
              </div>
              <div className="mt-3 space-y-2">
                {dayEvents.length ? dayEvents.map((event) => (
                  <button key={event.id} type="button" onClick={() => onEventSelect(event)} className={`flex w-full flex-col rounded-2xl border px-3 py-2 text-left ${getEventCategoryColor(event.category)}`}>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
                      <Clock3 className="h-3.5 w-3.5" />
                      {event.allDay ? "Ganztägig" : event.startTime ?? "09:00"}
                    </div>
                    <div className="mt-1 text-sm font-medium">{event.title}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{getEventCategoryLabel(event.category)}</div>
                  </button>
                )) : <p className="text-sm text-muted-foreground">Keine Termine</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
