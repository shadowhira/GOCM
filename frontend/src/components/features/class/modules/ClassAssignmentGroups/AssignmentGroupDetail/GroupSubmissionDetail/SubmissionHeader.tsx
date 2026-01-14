"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseBackendDateTime } from "@/lib/utils";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SubmissionStatus } from "@/types/submission";
import type { GradeResponse } from "@/types/grade";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SubmissionHeaderProps {
  submitByName?: string;
  submitByAvatarUrl?: string;
  submittedTime?: Date | null;
  status: SubmissionStatus;
  grade?: GradeResponse | null;
  maxScore: number;
}

export const SubmissionHeader = ({
  submitByName,
  submitByAvatarUrl,
  submittedTime,
  status,
  grade,
}: SubmissionHeaderProps): React.ReactElement => {
  const t = useTranslations();

  const formatSubmissionTime = (time: Date | string) => {
    try {
      const parsed = typeof time === 'string' 
        ? parseBackendDateTime(time) 
        : parseBackendDateTime(time.toISOString());
      if (!parsed) return String(time);
      return format(parsed, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return String(time);
    }
  };

  const getStatusInfo = () => {
    if (status === SubmissionStatus.Graded && grade) {
      return {
        badge: (
          <Badge
            variant="secondary"
            className="bg-success/20 text-success border-success/40"
          >
            {t("graded")}
          </Badge>
        ),
        className: "border-success/30",
      };
    }
    if (status === SubmissionStatus.Submitted) {
      return {
        badge: (
          <Badge
            variant="secondary"
            className="bg-info/20 text-info border-info/40"
          >
            {t("submitted")}
          </Badge>
        ),
        className: "border-info/30",
      };
    }
    return {
      badge: (
        <Badge variant="outline" className="bg-muted/20 text-muted-foreground">
          {t("not_submitted_yet")}
        </Badge>
      ),
      className: "border-muted",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/10">
            <AvatarImage src={submitByAvatarUrl} alt={submitByName || t("unknown")} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {submitByName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("submitted_by")}
            </p>
            <p className="font-semibold text-foreground">
              {submitByName || t("unknown_student")}
            </p>
          </div>
        </div>
        {statusInfo.badge}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
        <Clock className="w-4 h-4" />
        <span>
          {submittedTime
            ? formatSubmissionTime(submittedTime)
            : t("not_submitted_yet")}
        </span>
      </div>
    </div>
  );
};
