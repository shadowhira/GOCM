"use client";

import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizNavigatorProps {
  totalQuestions: number;
  answeredQuestions: Set<number>;
  currentQuestion?: number;
  onQuestionClick: (index: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  canSubmit: boolean;
  t: (key: string) => string;
  isTeacher?: boolean;
}

export function QuizNavigator({
  totalQuestions,
  answeredQuestions,
  currentQuestion,
  onQuestionClick,
  onSubmit,
  isSubmitting,
  canSubmit,
  t,
  isTeacher = false,
}: QuizNavigatorProps) {
  const answeredCount = answeredQuestions.size;
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="sticky top-20 h-fit">
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            {t("quiz_navigator")}
          </h3>
          {!isTeacher && (
            <>
              <div className="text-xs text-muted-foreground">
                {answeredCount}/{totalQuestions} {t("questions_answered")}
              </div>
              {/* Mini Progress Bar */}
              <div className="w-full bg-muted h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const questionNumber = index + 1;
            const isAnswered = answeredQuestions.has(questionNumber);
            const isCurrent = currentQuestion === questionNumber;

            return (
              <button
                key={questionNumber}
                onClick={() => onQuestionClick(index)}
                className={cn(
                  "relative h-10 rounded-md transition-all duration-200",
                  "flex items-center justify-center text-sm font-medium",
                  "hover:scale-105 hover:shadow-md",
                  isAnswered
                    ? isCurrent
                      ? "border-[3px] border-orange-400 bg-success text-success-foreground shadow-[0_0_16px_rgba(251,146,60,0.6)]"
                      : "border-2 border-success bg-success text-success-foreground"
                    : isCurrent
                    ? "border-[3px] border-cyan-400 bg-cyan-500 text-white font-bold shadow-[0_0_16px_rgba(34,211,238,0.6)]"
                    : "border-2 border-border bg-background text-muted-foreground hover:border-primary/50"
                )}
                title={
                  isAnswered
                    ? `${t("question")} ${questionNumber} - ${t("answered")}`
                    : `${t("question")} ${questionNumber} - ${t(
                        "not_answered"
                      )}`
                }
              >
                <span>{questionNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        {!isTeacher && (
          <div className="flex flex-col gap-2 text-xs mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-success bg-success"></div>
              <span className="text-muted-foreground">{t("answered")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-border bg-background"></div>
              <span className="text-muted-foreground">{t("not_answered")}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {canSubmit && (
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || answeredCount === 0}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                {t("submitting")}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {t("submit_quiz")}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
