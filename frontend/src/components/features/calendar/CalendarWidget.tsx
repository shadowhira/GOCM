"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import {
  format,
  startOfMonth,
  endOfMonth,
  parseISO,
  isToday,
} from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetCalendarEvents } from "@/queries/calendarQueries";
import type { CalendarEvent, CalendarEventType } from "@/types/calendar";

// Internal components
import { CalendarHeader } from "./CalendarHeader";
import { CalendarDayButton } from "./CalendarDayButton";
import { CalendarLegend } from "./CalendarLegend";
import { EventList } from "./EventList";
import { DAY_PICKER_CLASS_NAMES, CALENDAR_SKELETON_HEIGHT } from "./constants";

interface CalendarWidgetProps {
  className?: string;
}

/**
 * Main calendar widget component
 * Displays a calendar with event indicators and an events list
 */
export function CalendarWidget({ className }: CalendarWidgetProps) {
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [eventFilter, setEventFilter] = useState<"all" | CalendarEventType>(
    "all"
  );

  // Calculate date range for current view (current month + buffer)
  const dateRange = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  }, [selectedDate]);

  const { data, isLoading, isError, refetch } = useGetCalendarEvents({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    eventType: eventFilter === "all" ? "all" : eventFilter,
  });

  // Memoize events to prevent dependency changes on every render
  const events = useMemo(() => data?.events || [], [data?.events]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      const dateKey = format(parseISO(event.startDate), "yyyy-MM-dd");
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  // Get dates that have events (for calendar highlighting)
  const datesWithEvents = useMemo(() => {
    return Object.keys(eventsByDate).map((dateStr) => parseISO(dateStr));
  }, [eventsByDate]);

  // Separate dates by event type for different indicators
  const { assignmentDates, liveRoomDates, todayDeadlineDates } = useMemo(() => {
    const assignmentDates: Date[] = [];
    const liveRoomDates: Date[] = [];
    const todayDeadlineDates: Date[] = [];

    Object.entries(eventsByDate).forEach(([dateStr, dateEvents]) => {
      const date = parseISO(dateStr);
      const hasAssignment = dateEvents.some((e) => e.eventType === "assignment");
      const hasLiveRoom = dateEvents.some((e) => e.eventType === "liveroom");

      if (hasAssignment) {
        assignmentDates.push(date);
        if (isToday(date)) {
          todayDeadlineDates.push(date);
        }
      }
      if (hasLiveRoom) {
        liveRoomDates.push(date);
      }
    });

    return { assignmentDates, liveRoomDates, todayDeadlineDates };
  }, [eventsByDate]);

  // Get events for selected date
  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDateEvents = eventsByDate[selectedDateKey] || [];

  // Upcoming events (all future events, pagination handled in EventList)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events.filter((event) => parseISO(event.startDate) >= now);
  }, [events]);  const handleMonthChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  const handleFilterChange = (value: "all" | CalendarEventType) => {
    setEventFilter(value);
  };

  return (
    <div className={cn("grid gap-6 lg:grid-cols-3", className)}>
      {/* Calendar Widget */}
      <Card className="lg:col-span-1">
        <CalendarHeader
          eventFilter={eventFilter}
          onFilterChange={handleFilterChange}
          onTodayClick={handleTodayClick}
        />
        <CardContent className="pt-0">
          {isLoading ? (
            <Skeleton className={cn(CALENDAR_SKELETON_HEIGHT, "w-full")} />
          ) : (
            <>
              <DayPicker
                mode="single"
                selected={selectedDate}
                month={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                onMonthChange={handleMonthChange}
                locale={dateLocale}
                showOutsideDays
                today={new Date()}
                modifiers={{
                  hasEvents: datesWithEvents,
                  hasAssignment: assignmentDates,
                  hasLiveRoom: liveRoomDates,
                  todayDeadline: todayDeadlineDates,
                }}
                classNames={DAY_PICKER_CLASS_NAMES}
                components={{
                  Chevron: ({ orientation }) =>
                    orientation === "left" ? (
                      <ChevronLeftIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    ),
                  DayButton: CalendarDayButton,
                }}
              />
              <CalendarLegend />
            </>
          )}
        </CardContent>
      </Card>

      {/* Events List */}
      <EventList
        selectedDate={selectedDate}
        selectedDateEvents={selectedDateEvents}
        upcomingEvents={upcomingEvents}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />
    </div>
  );
}
