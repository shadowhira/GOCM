"use client";

import { useTranslations, useLocale } from "next-intl";
import { format, parseISO } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import Link from "next/link";
import { FileText, Video, Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";
import {
  CALENDAR_EVENT_COLORS,
  SUBMISSION_STATUS_COLORS,
} from "./constants";

interface EventCardProps {
  event: CalendarEvent;
}

/**
 * Event card displaying assignment or liveroom details
 * Uses design tokens for consistent theming
 */
export function EventCard({ event }: EventCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const dateLocale = locale === "vi" ? vi : enUS;

  const isAssignment = event.eventType === "assignment";
  const isGroupAssignment = isAssignment && event.assignmentType === "Group";
  const Icon = isAssignment ? FileText : Video;

  const linkHref = isAssignment
    ? `/class/${event.classId}/assignments/${event.id}`
    : `/live-room/${event.id}`;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "rounded-lg p-2 shrink-0",
              isAssignment
                ? CALENDAR_EVENT_COLORS.assignment.iconBg
                : CALENDAR_EVENT_COLORS.liveroom.iconBg
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium truncate">{event.title}</h4>
              <Badge variant="outline" className="text-xs">
                {isAssignment
                  ? isGroupAssignment
                    ? t("calendar_event_assignment_group")
                    : t("calendar_event_assignment")
                  : t("calendar_event_liveroom")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {event.className}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {isAssignment
                  ? `${t("calendar_deadline")}: ${format(
                      parseISO(event.startDate),
                      "HH:mm",
                      { locale: dateLocale }
                    )}`
                  : `${format(parseISO(event.startDate), "HH:mm", {
                      locale: dateLocale,
                    })} - ${
                      event.endDate
                        ? format(parseISO(event.endDate), "HH:mm", {
                            locale: dateLocale,
                          })
                        : ""
                    }`}
              </span>
              {isAssignment && event.isSubmitted !== null && (
                <span
                  className={cn(
                    "flex items-center gap-1",
                    event.isSubmitted
                      ? SUBMISSION_STATUS_COLORS.submitted
                      : SUBMISSION_STATUS_COLORS.notSubmitted
                  )}
                >
                  {event.isSubmitted ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t("calendar_submitted")}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      {t("calendar_not_submitted")}
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0">
            <Link href={linkHref}>
              <ExternalLink className="h-4 w-4 mr-1.5" />
              {t("calendar_view_detail")}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
