"use client";

import React from "react";
import { useTranslations } from "next-intl";
import type { QuizSubmissionStats } from "@/schemas/submissionSchema";

interface SubmissionStatsCardProps {
  stats: QuizSubmissionStats;
}

export const SubmissionStatsCard = ({ stats }: SubmissionStatsCardProps) => {
  const t = useTranslations();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
      <div className="text-center p-4 rounded-lg bg-muted border border-primary/20">
        <div className="text-2xl sm:text-3xl font-bold text-primary">
          {stats.totalQuestions}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t("total_questions_label")}
        </div>
      </div>
      <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
        <div className="text-2xl sm:text-3xl font-bold text-success">
          {stats.correctAnswers}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t("correct_answers_label")}
        </div>
      </div>
      <div className="text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <div className="text-2xl sm:text-3xl font-bold text-destructive">
          {stats.incorrectAnswers}
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t("incorrect_answers_label")}
        </div>
      </div>
      <div className="text-center p-4 rounded-lg bg-info/10 border border-info/20">
        <div className="text-2xl sm:text-3xl font-bold text-info">
          {stats.accuracyRate.toFixed(1)}%
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground mt-1">
          {t("accuracy_rate_label")}
        </div>
      </div>
    </div>
  );
};
