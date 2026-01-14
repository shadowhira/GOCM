"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface SubmissionStatusBadgeProps {
  hasSubmitted: boolean;
  isOverdue: boolean;
}

export function SubmissionStatusBadge({
  hasSubmitted,
  isOverdue,
}: SubmissionStatusBadgeProps) {
  const t = useTranslations();

  if (hasSubmitted) {
    return (
      <Badge
        variant="secondary"
        className="bg-success/20 text-success border-success/40"
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        {t("submitted")}
      </Badge>
    );
  }

  if (isOverdue) {
    return (
      <Badge
        variant="destructive"
        className="bg-destructive/20 text-destructive border-destructive/40"
      >
        <AlertCircle className="w-3 h-3 mr-1" />
        {t("overdue")}
      </Badge>
    );
  }

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
