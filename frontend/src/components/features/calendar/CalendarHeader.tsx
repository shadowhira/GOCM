"use client";

import { useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CalendarEventType } from "@/types/calendar";

interface CalendarHeaderProps {
  eventFilter: "all" | CalendarEventType;
  onFilterChange: (value: "all" | CalendarEventType) => void;
  onTodayClick: () => void;
}

/**
 * Calendar header with title, today button and event filter
 */
export function CalendarHeader({
  eventFilter,
  onFilterChange,
  onTodayClick,
}: CalendarHeaderProps) {
  const t = useTranslations();

  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5" />
          {t("calendar_title")}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onTodayClick}>
          {t("calendar_today")}
        </Button>
      </div>
      <Select
        value={eventFilter}
        onValueChange={(v) => onFilterChange(v as "all" | CalendarEventType)}
      >
        <SelectTrigger className="w-full mt-2">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("calendar_filter_all")}</SelectItem>
          <SelectItem value="assignment">
            {t("calendar_filter_assignment")}
          </SelectItem>
          <SelectItem value="liveroom">
            {t("calendar_filter_liveroom")}
          </SelectItem>
        </SelectContent>
      </Select>
    </CardHeader>
  );
}
