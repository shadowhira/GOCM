"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, Award, Edit } from "lucide-react";
import { cn, parseBackendDateTime } from "@/lib/utils";
import type { AssignmentResponse } from "@/types/assignment";
import { AssignmentType, AssignmentStatus } from "@/types/constants";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface AssignmentDetailHeaderProps {
  assignment: AssignmentResponse;
  onEdit?: () => void;
  isTeacher?: boolean;
}

export const AssignmentDetailHeader = ({
  assignment,
  onEdit,
  isTeacher = false,
}: AssignmentDetailHeaderProps) => {
  const t = useTranslations();

  const getTypeBadge = (type: AssignmentType) => {
    return (
      <Badge
        variant="outline"
        className="bg-primary/20 text-primary border-primary/40"
      >
        {type === AssignmentType.Essay ? t("essay") : 
        type === AssignmentType.Quiz ? t("quiz") : t("group")}
      </Badge>
    );
  };

  const formatDeadline = (deadline: Date | string) => {
    try {
      const parsed = typeof deadline === 'string' 
        ? parseBackendDateTime(deadline) 
        : parseBackendDateTime(deadline.toISOString());
      if (!parsed) return String(deadline);
      return format(parsed, "dd/MM/yyyy - HH:mm", {
        locale: vi,
      });
    } catch {
      return String(deadline);
    }
  };

  const formatCreatedAt = (createdAt: string) => {
    try {
      const parsed = parseBackendDateTime(createdAt);
      if (!parsed) return createdAt;
      return format(parsed, "dd/MM/yyyy", { locale: vi });
    } catch {
      return createdAt;
    }
  };

  return (
    <Card className="border shadow-md bg-card">
      <div className="p-4 sm:p-6 space-y-4">
        {/* Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 break-words">
              {assignment.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {getTypeBadge(assignment.type)}
            </div>
          </div>

          {isTeacher && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="shrink-0 w-full sm:w-auto"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t("edit")}
            </Button>
          )}
        </div>

        {/* Separator Line */}
        <div className="w-full h-px bg-border" />

        {/* Assignment Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium shrink-0">{t("created")}:</span>
            <span className="truncate">
              {formatCreatedAt(assignment.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 text-destructive shrink-0" />
            <span className="font-medium shrink-0">{t("deadline")}:</span>
            <span
              className={cn(
                "truncate",
                assignment.status === AssignmentStatus.Expired &&
                "text-destructive font-medium"
              )}
            >
              {formatDeadline(assignment.deadline)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="w-4 h-4 text-warning shrink-0" />
            <span className="font-medium shrink-0">{t("max_score")}:</span>
            <span className="font-semibold text-foreground">
              {assignment.maxScore}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
