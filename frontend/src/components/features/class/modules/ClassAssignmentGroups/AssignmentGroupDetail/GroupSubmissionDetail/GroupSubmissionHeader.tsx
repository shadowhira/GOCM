"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseBackendDateTime } from "@/lib/utils";
import { Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SubmissionStatus } from "@/types/submission";
import type { GradeResponse } from "@/types/grade";
import type { AssignmentGroupResponse } from "@/types/assignmentGroup";

interface GroupSubmissionHeaderProps {
  group?: AssignmentGroupResponse;
  submittedTime?: Date | null;
  status: SubmissionStatus;
  grade?: GradeResponse | null;
  maxScore: number;
}

export const GroupSubmissionHeader = ({
  group,
  submittedTime,
  status,
  grade,
  maxScore,
}: GroupSubmissionHeaderProps) => {
  const t = useTranslations();

  const formatSubmissionTime = (time: Date | string) => {
    try {
      const parsed = typeof time === 'string' 
        ? parseBackendDateTime(time) 
        : parseBackendDateTime(time.toISOString());
      if (!parsed) return String(time);
      return format(parsed, "dd/MM/yyyy - HH:mm:ss", { locale: vi });
    } catch {
      return String(time);
    }
  };

  const getStatusBadge = () => {
    if (status === SubmissionStatus.Graded && grade) {
      return (
        <Badge
          variant="secondary"
          className="bg-success/20 text-success border-success/40"
        >
          {t("graded_with_score")} {grade.score}/{maxScore}
        </Badge>
      );
    }
    if (status === SubmissionStatus.Submitted) {
      return (
        <Badge
          variant="secondary"
          className="bg-info/20 text-info border-info/40"
        >
          {t("submitted")}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-muted/20 text-muted-foreground">
        {t("not_submitted_yet")}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
      <div className="space-y-2 sm:space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <span className="text-sm sm:text-base font-medium">
            {t("group")}: {group?.name || t("unknown")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <span className="text-xs sm:text-sm text-muted-foreground">
            {t("submission_time_label")}:{" "}
            {submittedTime
              ? formatSubmissionTime(submittedTime)
              : t("not_submitted_yet")}
          </span>
        </div>
      </div>
      {getStatusBadge()}
    </div>
  );
};
