import { useQuery } from "@tanstack/react-query";
import { calendarApi } from "@/api/calendarApi";
import type { GetCalendarEventsRequest } from "@/types/calendar";

// ============ QUERY KEYS ============
export const calendarKeys = {
  all: ["calendar"] as const,
  events: () => [...calendarKeys.all, "events"] as const,
  eventsByParams: (params?: GetCalendarEventsRequest) =>
    [...calendarKeys.events(), params] as const,
};

// ============ QUERIES (GET) ============

/**
 * Get calendar events for the current user
 * @param params - Optional filter parameters (date range, classId, eventType)
 */
export const useGetCalendarEvents = (params?: GetCalendarEventsRequest) => {
  return useQuery({
    queryKey: calendarKeys.eventsByParams(params),
    queryFn: () => calendarApi.getEvents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
