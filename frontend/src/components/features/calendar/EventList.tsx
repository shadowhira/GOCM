"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { CalendarDays, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { CALENDAR_PAGINATION } from "@/config/pagination";
import type { CalendarEvent } from "@/types/calendar";
import { EventCard } from "./EventCard";
import { UpcomingEventItem } from "./UpcomingEventItem";

interface EventListProps {
  selectedDate: Date;
  selectedDateEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

/**
 * Events list panel showing selected date events and upcoming events
 */
export function EventList({
  selectedDate,
  selectedDateEvents,
  upcomingEvents,
  isLoading,
  isError,
  onRetry,
}: EventListProps) {
  const t = useTranslations();
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;

  // Pagination state for upcoming events
  const [upcomingPage, setUpcomingPage] = useState(1);
  const pageSize = CALENDAR_PAGINATION.UPCOMING_EVENTS_PAGE_SIZE;
  const totalUpcomingPages = Math.ceil(upcomingEvents.length / pageSize);

  // Reset to page 1 when upcoming events list changes (filter/month change)
  useEffect(() => {
    setUpcomingPage(1);
  }, [upcomingEvents.length]);

  // Paginated upcoming events
  const paginatedUpcomingEvents = useMemo(() => {
    const startIndex = (upcomingPage - 1) * pageSize;
    return upcomingEvents.slice(startIndex, startIndex + pageSize);
  }, [upcomingEvents, upcomingPage, pageSize]);

  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Selected Date Events */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {format(selectedDate, "EEEE, dd MMMM yyyy", { locale: dateLocale })}
              </CardTitle>
              {selectedDateEvents.length > 0 && (
                <CardDescription>
                  {t("calendar_events_count", { count: selectedDateEvents.length })}
                </CardDescription>
              )}
            </div>
            {selectedDateEvents.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <CalendarDays className="h-3 w-3 mr-1" />
                {selectedDateEvents.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <EventListSkeleton />
          ) : isError ? (
            <EventListError onRetry={onRetry} />
          ) : selectedDateEvents.length === 0 ? (
            <EventListEmpty />
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((event) => (
                <EventCard key={`${event.eventType}-${event.id}`} event={event} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  {t("calendar_upcoming_events")}
                </CardTitle>
                <CardDescription>
                  {t("calendar_upcoming_count", { count: upcomingEvents.length })}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {upcomingEvents.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {paginatedUpcomingEvents.map((event) => (
                <UpcomingEventItem
                  key={`upcoming-${event.eventType}-${event.id}`}
                  event={event}
                />
              ))}
            </div>
            {/* Pagination for upcoming events */}
            {totalUpcomingPages > 1 && (
              <div className="mt-4 pt-4 border-t flex justify-end">
                <Pagination
                  currentPage={upcomingPage}
                  totalPages={totalUpcomingPages}
                  onPageChange={setUpcomingPage}
                  hasPreviousPage={upcomingPage > 1}
                  hasNextPage={upcomingPage < totalUpcomingPages}
                  align="end"
                  maxVisiblePages={5}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function EventListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

function EventListEmpty() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{t("calendar_no_events_for_date")}</p>
    </div>
  );
}

interface EventListErrorProps {
  onRetry: () => void;
}

function EventListError({ onRetry }: EventListErrorProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-muted-foreground mb-4">{t("calendar_error")}</p>
      <Button onClick={onRetry} variant="outline">
        {t("try_again")}
      </Button>
    </div>
  );
}
