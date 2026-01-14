"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const t = useTranslations();

  switch (status) {
    case "graded":
      return (
        <Badge variant="default" className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {t("graded_status")}
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
          <Clock className="w-3 h-3 mr-1" />
          {t("pending_status")}
        </Badge>
      );
    case "not_submitted":
      return (
        <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
          <XCircle className="w-3 h-3 mr-1" />
          {t("not_submitted_status")}
        </Badge>
      );
    default:
      return null;
  }
};

export default StatusBadge;
