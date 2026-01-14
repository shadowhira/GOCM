import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssignmentGradeSummary } from "@/types/grade";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseBackendDateTime } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface AssignmentGradeCardProps {
  assignment: AssignmentGradeSummary;
  classId: number;
  locale: string;
  currentPage?: number;
}

export const AssignmentGradeCard = ({
  assignment,
  classId,
  locale,
  currentPage = 1,
}: AssignmentGradeCardProps) => {
  const t = useTranslations();

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "text-grade-excellent";
    if (percentage >= 60) return "text-warning";
    return "text-error";
  };

  const getGradeBgColor = (percentage: number) => {
    if (percentage >= 80) return "bg-success/10";
    if (percentage >= 60) return "bg-warning/10";
    return "bg-error/10";
  };

  const getGradeBorderColor = (percentage: number) => {
    if (percentage >= 80) return "border-success/20";
    if (percentage >= 60) return "border-warning/20";
    return "border-error/20";
  };

  const getCircleColor = (percentage: number) => {
    if (percentage >= 80) return "text-grade-excellent";
    if (percentage >= 60) return "text-warning";
    return "text-error";
  };

  const getAssignmentTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "quiz":
        return (
          <Badge
            variant="default"
            className="bg-success/10 text-grade-excellent border-success/20 hover:bg-success/10 text-xs"
          >
            {t("quiz")}
          </Badge>
        );
      case "essay":
        return (
          <Badge
            variant="secondary"
            className="bg-info/10 text-info border-info/20 hover:bg-info/10 text-xs"
          >
            {t("essay")}
          </Badge>
        );
      case "group":
        return (
          <Badge
            variant="default"
            className="bg-error/10 text-error border-error/20 hover:bg-error/10 text-xs"
          >
            {t("group")}
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs">{type}</Badge>;
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return t("no_due_date");
    try {
      const parsed = parseBackendDateTime(dateString);
      if (!parsed) return t("invalid_date");
      return format(parsed, "dd/MM/yyyy", { locale: vi });
    } catch {
      return t("invalid_date");
    }
  };

  const gradingProgress = assignment.totalSubmissions > 0 
    ? (assignment.gradedSubmissions / assignment.totalSubmissions) * 100 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-all relative overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3">
          {getAssignmentTypeBadge(assignment.assignmentType)}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-neutral-900 mb-2 line-clamp-2 min-h-[2.5rem]">
          {assignment.assignmentTitle}
        </h3>

        {/* Due Date */}
        <div className="flex items-center gap-1.5 text-xs text-warning mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>{t("assignment_due_date")}: {formatDate(assignment.dueDate)}</span>
        </div>

        {/* Average Score Section */}
        <div className="mb-4">
          <div className="text-[10px] text-neutral-500 mb-1.5 font-medium">{t("assignment_average_score")}</div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold text-neutral-900">
                {assignment.averageScore.toFixed(1)}
              </span>
              <span className="text-base text-neutral-400 ml-1">/10</span>
            </div>
            
            {/* Circular Progress */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className="text-neutral-200"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - assignment.averagePercentage / 100)}`}
                  className={cn(getCircleColor(assignment.averagePercentage))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn("text-xs font-semibold", getGradeColor(assignment.averagePercentage))}>
                  {assignment.averagePercentage.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-[10px] text-neutral-500 mb-1 font-medium">{t("assignment_submitted")}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold text-neutral-900">
                {assignment.totalSubmissions}
              </span>
              <span className="text-xs text-neutral-400">/{assignment.totalSubmissions}</span>
            </div>
            <Progress 
              value={(assignment.totalSubmissions / 100) * 100} 
              className="h-1 mt-1.5"
            />
          </div>
          
          <div>
            <div className="text-[10px] text-neutral-500 mb-1 font-medium">{t("assignment_graded")}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold text-neutral-900">
                {assignment.gradedSubmissions}
              </span>
              <span className="text-xs text-neutral-400">/{assignment.totalSubmissions}</span>
            </div>
            <Progress 
              value={gradingProgress} 
              className="h-1 mt-1.5"
            />
          </div>
        </div>

        {/* View Details Button */}
        <Link
          href={`/${locale}/class/${classId}/grades/assignments/${assignment.assignmentId}?returnTab=assignments&page=${currentPage}`}
          className="block"
        >
          <Button
            variant="outline"
            className="w-full border-neutral-300 text-neutral-700 hover:bg-neutral-50 h-8 text-xs"
          >
            {t("view_details")}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};