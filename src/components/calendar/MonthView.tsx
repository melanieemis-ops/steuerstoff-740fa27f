import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays, Circle } from "lucide-react";
import type { CalendarEvent } from "@/lib/calendar-types";
import { calendarWeekdays, formatDateKey, formatDateLabel, getEventCategoryColor, getEventCategoryLabel } from "@/lib/calendar-utils";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  selectedDate: Date;
  onDaySelect: (date: Date) => void;
  onEventSelect: (event: CalendarEvent) => void;
  onLongPress: (date: Date) => void;
  onSwipe: (direction: -1 | 1) => void;
}

export function MonthView({ currentDate, events, selectedDate, onDaySelect, onEventSelect, onLongPress, onSwipe }: MonthViewProps) {
  const todayKey = formatDateKey(new Date());
  const days = Array.from({ length: 42 }, (_, index) => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const offset = index - ((start.getDay() + 6) % 7);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
  });

  const dayEvents = (day: Date) => {
    const key = formatDateKey(day);
    return events.filter((event) => event.startDate === key || event.endDate === key || (event.startDate < key && event.endDate && event.endDate >= key));
  };

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-border/70 bg-card/90 p-2 shadow-card-soft sm:p-3" onTouchStart={(event) => {
      const touchStartX = event.touches[0]?.clientX ?? 0;
      const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
      if (touchStartX - touchEndX > 60) onSwipe(1);
      if (touchStartX - touchEndX < -60) onSwipe(-1);
    }}>
      <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {calendarWeekdays.map((day) => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const key = formatDateKey(day);
          const isSameMonth = day.getMonth() === currentDate.getMonth();
          const isToday = key === todayKey;
          const isSelected = key === formatDateKey(selectedDate);
          const dayItems = dayEvents(day).slice(0, 2);
          const extraCount = Math.max(0, dayEvents(day).length - 2);
          return (
            <div key={`${key}-${index}`} className={`min-h-[96px] rounded-[1rem] border p-2 ${isSameMonth ? "border-border/60 bg-background/70" : "border-transparent bg-transparent opacity-55"}`}>
              <button type="button" onClick={() => onDaySelect(day)} onContextMenu={(event) => { event.preventDefault(); onLongPress(day); }} onLongPress={() => onLongPress(day)} className="flex w-full flex-col items-start gap-1 text-left">
                <div className={`flex items-center gap-1 text-[11px] ${isToday ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  <span>{day.getDate()}</span>
                  {isToday ? <Circle className="h-2.5 w-2.5 fill-foreground text-foreground" /> : null}
                </div>
                {dayItems.map((event) => (
                  <button key={event.id} type="button" onClick={(e) => { e.stopPropagation(); onEventSelect(event); }} className={`max-w-full rounded-full border px-2 py-0.5 text-[10px] text-left ${getEventCategoryColor(event.category)} truncate`}>
                    {event.title}
                  </button>
                ))}
                {extraCount > 0 ? <span className="text-[10px] text-muted-foreground">+ {extraCount} weitere</span> : null}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
