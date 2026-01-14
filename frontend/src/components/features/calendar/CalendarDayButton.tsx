"use client";

import { cn } from "@/lib/utils";
import type { DayButtonProps, CalendarDay, Modifiers } from "react-day-picker";
import {
  CALENDAR_EVENT_COLORS,
  CALENDAR_INDICATOR_COLORS,
} from "./constants";

interface CalendarDayButtonProps extends Omit<DayButtonProps, 'day' | 'modifiers'> {
  day: CalendarDay;
  modifiers: Modifiers & {
    hasAssignment?: boolean;
    hasLiveRoom?: boolean;
    todayDeadline?: boolean;
  };
}

/**
 * Custom DayButton component for the calendar
 * Displays event indicators (assignment=red, liveroom=green)
 * and highlights today with a blue ring
 */
export function CalendarDayButton({
  day,
  modifiers,
  ...props
}: CalendarDayButtonProps) {
  const hasAssignment = modifiers.hasAssignment;
  const hasLiveRoom = modifiers.hasLiveRoom;
  const isTodayDeadline = modifiers.todayDeadline;
  const isTodayDate = modifiers.today;

  return (
    <button
      {...props}
      className={cn(
        "h-9 w-9 p-0 font-normal rounded-md inline-flex items-center justify-center relative",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        // Today highlight - uses info color (blue ring) - always show for today (unless selected or has deadline)
        isTodayDate &&
          !isTodayDeadline &&
          !modifiers.selected &&
          `ring-2 ${CALENDAR_INDICATOR_COLORS.today} font-semibold`,
        // Selected state - uses error color (red ring) for emphasis
        modifiers.selected &&
          "ring-2 ring-error bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        // Outside month
        modifiers.outside && "text-muted-foreground opacity-50",
        modifiers.disabled && "text-muted-foreground opacity-50",
        // Today with deadline - uses error color (red ring, overrides blue)
        isTodayDeadline &&
          !modifiers.selected &&
          `ring-2 ${CALENDAR_INDICATOR_COLORS.todayDeadline} ring-offset-1`
      )}
    >
      {day.date.getDate()}
      {/* Event indicators - using semantic colors from design tokens */}
      {(hasAssignment || hasLiveRoom) && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {hasAssignment && (
            <span
              className={cn(
                "h-1 w-1 rounded-full",
                CALENDAR_EVENT_COLORS.assignment.indicator
              )}
            />
          )}
          {hasLiveRoom && (
            <span
              className={cn(
                "h-1 w-1 rounded-full",
                CALENDAR_EVENT_COLORS.liveroom.indicator
              )}
            />
          )}
        </span>
      )}
    </button>
  );
}
