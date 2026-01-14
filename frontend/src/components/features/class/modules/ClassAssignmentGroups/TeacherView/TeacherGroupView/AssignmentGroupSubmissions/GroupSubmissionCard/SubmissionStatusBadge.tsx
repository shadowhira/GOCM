import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, Clock } from "lucide-react";
import { SubmissionStatus } from "@/types/submission";
import type { GradeResponse } from "@/types/grade";

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
  grade?: GradeResponse;
  maxGrade: number;
  t: (key: string) => string;
}

export function SubmissionStatusBadge({
  status,
  grade,
  maxGrade,
  t,
}: SubmissionStatusBadgeProps): React.ReactElement {
  switch (status) {
    case SubmissionStatus.Graded:
      return (
        <Badge
          variant="secondary"
          className="bg-success/20 text-success border-success/40"
        >
          <Star className="w-3 h-3 mr-1" />
          {t("graded")} {grade && `(${grade.score}/${maxGrade})`}
        </Badge>
      );
    case SubmissionStatus.Submitted:
      return (
        <Badge
          variant="outline"
          className="bg-primary/10 text-primary border-primary/30"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          {t("submitted")}
        </Badge>
      );
    case SubmissionStatus.NotSubmitted:
    default:
      return (
        <Badge
          variant="outline"
          className="bg-warning/20 text-warning border-warning/40"
        >
          <Clock className="w-3 h-3 mr-1" />
          {t("not_submitted")}
        </Badge>
      );
  }
}
