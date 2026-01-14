import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  FileText,
  Target,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatisticsCardsProps {
  totalStudents: number;
  totalAssignments: number;
  averageClassScore: number;
  averageClassPercentage: number;
  gradingProgress: number;
}

export const StatisticsCards = ({
  totalStudents,
  totalAssignments,
  averageClassScore,
  averageClassPercentage,
  gradingProgress,
}: StatisticsCardsProps) => {
  const t = useTranslations();

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 60) return "text-warning";
    return "text-destructive";
  };

  const getGradeBadge = (percentage: number) => {
    if (percentage >= 80)
      return (
        <Badge
          variant="default"
          className="bg-success/10 text-success border-success/20"
        >
          {t("grade_good")}
        </Badge>
      );
    if (percentage >= 60)
      return (
        <Badge
          variant="secondary"
          className="bg-warning/10 text-warning border-warning/20"
        >
          {t("grade_average")}
        </Badge>
      );
    return (
      <Badge
        variant="destructive"
        className="bg-destructive/10 text-destructive border-destructive/20"
      >
        {t("grade_needs_improvement")}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Students */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("total_students")}
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {totalStudents}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("students_in_class")}
          </p>
        </CardContent>
      </Card>

      {/* Total Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("total_assignments")}
          </CardTitle>
          <FileText className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {totalAssignments}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("assignments_given")}
          </p>
        </CardContent>
      </Card>

      {/* Average Class Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("average_class_score")}
          </CardTitle>
          <Target className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "text-3xl font-bold",
              getGradeColor(averageClassPercentage)
            )}
          >
            {averageClassScore.toFixed(1)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">
              {averageClassPercentage.toFixed(1)}%
            </p>
            {getGradeBadge(averageClassPercentage)}
          </div>
        </CardContent>
      </Card>

      {/* Grading Progress */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {t("grading_progress")}
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            {gradingProgress.toFixed(0)}%
          </div>
          <Progress value={gradingProgress} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">{t("assignments_graded")}</p>
        </CardContent>
      </Card>
    </div>
  );
};