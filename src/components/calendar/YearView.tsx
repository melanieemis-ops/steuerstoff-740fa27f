import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays, ChevronRight } from "lucide-react";
import { calendarMonthNames, calendarWeekdays, formatDateKey, getEventCategoryColor } from "@/lib/calendar-utils";
import type { CalendarEvent } from "@/lib/calendar-types";

interface YearViewProps {
  year: number;
  selectedDate: Date;
  events: CalendarEvent[];
  onMonthSelect: (date: Date) => void;
  onYearChange: (direction: -1 | 1) => void;
}

export function YearView({ year, selectedDate, events, onMonthSelect, onYearChange }: YearViewProps) {
  const todayKey = formatDateKey(new Date());
  const months = Array.from({ length: 12 }, (_, monthIndex) => {
    const date = new Date(year, monthIndex, 1);
    const days = Array.from({ length: 42 }, (_, index) => new Date(year, monthIndex, index - 6));
    const monthEvents = events.filter((event) => event.startDate.startsWith(`${year}-${String(monthIndex + 1).padStart(2, "0")}`));
    return { date, days, monthEvents };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-[1.4rem] border border-border/70 bg-card/90 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Jahr</p>
          <h3 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{year}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onYearChange(-1)} className="rounded-full border border-border bg-background p-2 text-foreground">←</button>
          <button type="button" onClick={() => onYearChange(1)} className="rounded-full border border-border bg-background p-2 text-foreground">→</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {months.map((month, monthIndex) => {
          const monthName = calendarMonthNames[monthIndex];
          const openCount = month.monthEvents.filter((event) => !event.completed).length;
          return (
            <button key={monthName} type="button" onClick={() => onMonthSelect(month.date)} className="rounded-[1.4rem] border border-border/70 bg-card/90 p-3 text-left shadow-card-soft transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{monthName}</p>
                  <p className="text-[11px] text-muted-foreground">{openCount} offene Termine</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 grid grid-cols-7 gap-1 text-[10px] text-muted-foreground">
                {calendarWeekdays.map((weekday) => (
                  <span key={weekday} className="text-center">{weekday}</span>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {month.days.slice(0, 35).map((day, dayIndex) => {
                  const dayKey = formatDateKey(day);
                  const isToday = dayKey === todayKey;
                  const hasEvent = month.monthEvents.some((event) => event.startDate === dayKey);
                  const eventCount = month.monthEvents.filter((event) => event.startDate === dayKey).length;
                  const notCurrentMonth = day.getMonth() !== monthIndex;
                  return (
                    <div key={`${dayKey}-${dayIndex}`} className={`flex h-7 items-center justify-center rounded-full text-[10px] ${notCurrentMonth ? "text-muted-foreground/40" : "text-foreground"} ${isToday ? "bg-foreground text-background" : ""}`}>
                      {day.getDate()}
                      {hasEvent ? <span className={`ml-1 h-1.5 w-1.5 rounded-full ${eventCount > 1 ? "bg-foreground/60" : "bg-[#b84d84]"}`} /> : null}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
