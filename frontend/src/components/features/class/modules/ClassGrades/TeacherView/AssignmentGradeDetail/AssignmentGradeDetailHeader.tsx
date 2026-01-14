import React from "react";
import { useTranslations } from "next-intl";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  Award,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseBackendDateTime } from "@/lib/utils";

interface AssignmentGradeDetailHeaderProps {
  assignmentTitle: string;
  assignmentType: string;
  maxScore: number;
  dueDate?: string | null;
  backHref: string;
}

export const AssignmentGradeDetailHeader = ({
  assignmentTitle,
  assignmentType,
  maxScore,
  dueDate,
  backHref,
}: AssignmentGradeDetailHeaderProps) => {
  const t = useTranslations();

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return t("not_available");
    try {
      const parsed = parseBackendDateTime(dateString);
      if (!parsed) return t("invalid_date");
      return format(parsed, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return t("invalid_date");
    }
  };

  return (
    <>
      {/* Back Button */}
      <BackButton href={backHref} />

      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {assignmentTitle}
              </h1>
              {assignmentType.toLowerCase() === "group" && (
                <Badge
                  variant="default"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  <Users className="w-3 h-3 mr-1" />
                  {t("group_assignment")}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{t(assignmentType === "Quiz" ? "quiz" : "assignment")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>{t("max_score")}: {maxScore}</span>
              </div>
              {dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{t("due_date_short")}: {formatDate(dueDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};