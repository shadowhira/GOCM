"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CALENDAR_EVENT_COLORS } from "./constants";

/**
 * Calendar legend showing event type indicators
 * Uses design tokens for consistent color theming
 */
export function CalendarLegend() {
  const t = useTranslations();

  return (
    <div className="mt-4 pt-4 border-t space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        {t("calendar_legend")}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              CALENDAR_EVENT_COLORS.assignment.indicator
            )}
          />
          <span className="text-muted-foreground">
            {t("calendar_legend_assignment")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              CALENDAR_EVENT_COLORS.liveroom.indicator
            )}
          />
          <span className="text-muted-foreground">
            {t("calendar_legend_liveroom")}
          </span>
        </div>
      </div>
    </div>
  );
}
