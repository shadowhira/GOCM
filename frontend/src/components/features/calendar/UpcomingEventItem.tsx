"use client";

import { useLocale, useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import Link from "next/link";
import { FileText, Video, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";
import { CALENDAR_EVENT_COLORS } from "./constants";

interface UpcomingEventItemProps {
  event: CalendarEvent;
}

/**
 * Compact event item for the upcoming events list
 * Uses design tokens for consistent theming
 */
export function UpcomingEventItem({ event }: UpcomingEventItemProps) {
  const locale = useLocale();
  const t = useTranslations();
  const dateLocale = locale === "vi" ? vi : enUS;

  const isAssignment = event.eventType === "assignment";
  const Icon = isAssignment ? FileText : Video;

  const linkHref = isAssignment
    ? `/class/${event.classId}/assignments/${event.id}`
    : `/live-room/${event.id}`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
      <div
        className={cn(
          "rounded p-1.5 shrink-0",
          isAssignment
            ? CALENDAR_EVENT_COLORS.assignment.iconBg
            : CALENDAR_EVENT_COLORS.liveroom.iconBg
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{event.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-xs text-muted-foreground">
            {format(parseISO(event.startDate), "dd/MM - HH:mm", {
              locale: dateLocale,
            })}
          </p>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              isAssignment
                ? CALENDAR_EVENT_COLORS.assignment.badge
                : CALENDAR_EVENT_COLORS.liveroom.badge
            )}
          >
            {event.className}
          </Badge>
        </div>
      </div>
      <Button variant="ghost" size="sm" asChild className="shrink-0 h-8 px-2">
        <Link href={linkHref}>
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="sr-only">{t("calendar_view_detail")}</span>
        </Link>
      </Button>
    </div>
  );
}
