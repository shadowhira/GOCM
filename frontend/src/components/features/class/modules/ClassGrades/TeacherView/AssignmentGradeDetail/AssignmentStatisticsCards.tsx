import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GradeStatistics {
  totalStudents: number;
  graded: number;
  pending: number;
  notSubmitted: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

interface AssignmentStatisticsCardsProps {
  statistics: GradeStatistics;
}

export const AssignmentStatisticsCards = ({
  statistics,
}: AssignmentStatisticsCardsProps) => {
  const t = useTranslations();

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 8) return "text-success font-semibold";
    if (score >= 6.5) return "text-primary font-semibold";
    if (score >= 5) return "text-warning font-semibold";
    return "text-destructive font-semibold";
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("total_students")}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{statistics.totalStudents}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("grade_summary_breakdown", { 
              graded: statistics.graded, 
              pending: statistics.pending, 
              notSubmitted: statistics.notSubmitted 
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("avg_score")}</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", getScoreColor(statistics.averageScore))}>
            {statistics.averageScore > 0 ? statistics.averageScore.toFixed(2) : t("not_available")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("scale_10")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("highest_score")}</CardTitle>
          <Award className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", getScoreColor(statistics.highestScore))}>
            {statistics.highestScore > 0 ? statistics.highestScore.toFixed(2) : t("not_available")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("scale_10")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("lowest_score")}</CardTitle>
          <Award className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", getScoreColor(statistics.lowestScore))}>
            {statistics.lowestScore > 0 ? statistics.lowestScore.toFixed(2) : t("not_available")}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("scale_10")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};