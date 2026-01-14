"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GradeResponse } from "@/types/grade";

interface GradeCardProps {
  grade: GradeResponse;
  maxScore: number;
}

export const GradeCard = ({ grade, maxScore }: GradeCardProps) => {
  const t = useTranslations();

  return (
    <Card className="p-6 border-success/30 bg-success/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-success" />
          <h3 className="text-xl font-medium">
            {t("grading_result_title")}
          </h3>
        </div>
        <Badge
          variant="secondary"
          className="bg-success/20 text-success border-success/40 text-lg px-4 py-2"
        >
          {grade.score}/{maxScore} {t("points_label")}
        </Badge>
      </div>
      {grade.feedback && (
        <div className="mt-4 p-4 bg-background rounded border">
          <h4 className="font-medium mb-2">{t("teacher_feedback_from")}</h4>
          <p className="text-sm">{grade.feedback}</p>
        </div>
      )}
    </Card>
  );
};
