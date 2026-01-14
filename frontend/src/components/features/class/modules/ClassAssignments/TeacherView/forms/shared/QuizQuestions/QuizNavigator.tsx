"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface QuizNavigatorProps {
  totalQuestions: number;
  currentQuestion?: number;
  onQuestionClick: (index: number) => void;
  onAddQuestion: () => void;
  getQuestionStatus: (index: number) => "complete" | "incomplete" | "error";
}

export function QuizNavigator({
  totalQuestions,
  currentQuestion,
  onQuestionClick,
  onAddQuestion,
  getQuestionStatus,
}: QuizNavigatorProps) {
  const t = useTranslations();
  const completeCount = Array.from({ length: totalQuestions }).filter(
    (_, i) => getQuestionStatus(i) === "complete"
  ).length;
  const progress =
    totalQuestions > 0 ? (completeCount / totalQuestions) * 100 : 0;

  if (totalQuestions === 0) return null;

  return (
    <div className="sticky top-20 h-fit">
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            {t("quiz_navigator")}
          </h3>
          <div className="text-xs text-muted-foreground">
            {completeCount}/{totalQuestions} {t("completed")}
          </div>
          {/* Mini Progress Bar */}
          <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2 mb-4">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const questionNumber = index + 1;
            const status = getQuestionStatus(index);
            const isCurrent = currentQuestion === index;

            return (
              <button
                key={questionNumber}
                type="button"
                onClick={() => onQuestionClick(index)}
                className={cn(
                  "relative h-10 rounded-md border-2 transition-all duration-200",
                  "flex items-center justify-center text-sm font-medium",
                  "hover:scale-105 hover:shadow-md",
                  isCurrent && "ring-2 ring-primary ring-offset-2",
                  status === "complete"
                    ? "border-success bg-success text-success-foreground"
                    : status === "error"
                    ? "border-error bg-error text-error-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50"
                )}
                title={
                  status === "complete"
                    ? `${t("question")} ${questionNumber} - ${t("complete")}`
                    : status === "error"
                    ? `${t("question")} ${questionNumber} - ${t("has_errors")}`
                    : `${t("question")} ${questionNumber} - ${t("incomplete")}`
                }
              >
                <span>{questionNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 text-xs mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-success bg-success"></div>
            <span className="text-muted-foreground">{t("complete")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-error bg-error"></div>
            <span className="text-muted-foreground">{t("error")}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-border bg-background"></div>
            <span className="text-muted-foreground">{t("incomplete")}</span>
          </div>
        </div>

        {/* Add Question Button */}
        <Button
          type="button"
          onClick={onAddQuestion}
          className="w-full"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("add_question")}
        </Button>
      </div>
    </div>
  );
}
