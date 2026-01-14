"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getScoreColor } from "./helpers";
import type { StudentGradesSummary } from "@/types/grade";

interface SummaryCardProps {
  summary: Pick<
    StudentGradesSummary,
    | "averageScore"
    | "averagePercentage"
    | "totalAssignments"
    | "gradedCount"
    | "pendingCount"
    | "notSubmittedCount"
  >;
  t: (key: string) => string;
}

export const SummaryCard = ({ summary, t }: SummaryCardProps) => {
  const { averageScore, averagePercentage, totalAssignments, gradedCount, pendingCount, notSubmittedCount } = summary;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {t("grade_summary")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("average_score")}</p>
            <p className={cn("text-3xl font-bold", getScoreColor(averageScore))}>{averageScore.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{averagePercentage.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("total_assignments")}</p>
            <p className="text-3xl font-bold">{totalAssignments}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("graded")}</p>
            <p className="text-3xl font-bold text-success">{gradedCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("pending_grading")}</p>
            <p className="text-3xl font-bold text-warning">{pendingCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("not_submitted")}</p>
            <p className="text-3xl font-bold text-destructive">{notSubmittedCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
