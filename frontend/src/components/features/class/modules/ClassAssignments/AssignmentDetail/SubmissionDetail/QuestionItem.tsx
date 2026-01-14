"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuestionType } from "@/types/constants";
import type { QuizAnswer, QuizOption, QuizQuestion } from "@/types/quiz";

interface QuestionItemProps {
  question: QuizQuestion;
  answer?: QuizAnswer;
  questionIndex: number;
}

export const QuestionItem = ({
  question,
  answer,
  questionIndex,
}: QuestionItemProps) => {
  const t = useTranslations();
  const isAnswered = !!answer;
  const isCorrect = answer?.isCorrect || false;

  return (
    <Card
      className={cn(
        "p-4 sm:p-6",
        isCorrect
          ? "border-l-success bg-success/5"
          : isAnswered
          ? "border-l-destructive bg-destructive/5"
          : "border-l-muted bg-muted/5"
      )}
    >
      <div className="space-y-4">
        {/* Header câu hỏi */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div className="flex items-start gap-2 sm:gap-3 w-full">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold shrink-0",
                isCorrect
                  ? "bg-success text-success-foreground"
                  : isAnswered
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isCorrect ? (
                <CheckCircle className="w-5 h-5" />
              ) : isAnswered ? (
                <XCircle className="w-5 h-5" />
              ) : (
                questionIndex + 1
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm sm:text-base md:text-lg font-medium text-foreground mb-2 sm:mb-3">
                {t("question_prefix")} {questionIndex + 1}:{" "}
                {question.questionText}
              </h4>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Badge variant="outline" className="text-sm">
                  {question.questionType === QuestionType.SingleChoice
                    ? t("single_choice_label")
                    : t("multiple_choice_label")}
                </Badge>
                <Badge variant="secondary" className="text-sm font-semibold">
                  {question.point} {t("points_lower")}
                </Badge>
                {isAnswered && (
                  <Badge
                    variant={isCorrect ? "default" : "destructive"}
                    className={cn(
                      "text-sm",
                      isCorrect
                        ? "bg-success/10 text-success border-success/30"
                        : ""
                    )}
                  >
                    {isCorrect ? t("answer_correct") : t("answer_incorrect")}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách lựa chọn */}
        <div className="ml-7 sm:ml-13 space-y-2 sm:space-y-3">
          {question.options.map((option: QuizOption, optionIndex: number) => {
            const isSelected =
              answer?.selectedOptionIds?.includes(option.id ?? 0) || false;
            const isCorrectOption = option.isCorrect ?? false;

            return (
              <div
                key={option.id}
                className="flex items-center gap-2 sm:gap-3"
              >
                {/* Check icon for selected/correct answer */}
                <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0">
                  {isSelected ? (
                    <CheckCircle
                      className={cn(
                        "w-3 h-3 sm:w-4 sm:h-4",
                        isCorrectOption ? "text-success" : "text-destructive"
                      )}
                    />
                  ) : isCorrectOption ? (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-warning bg-warning/20" />
                  ) : (
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-muted" />
                  )}
                </div>
                <div
                  className={cn(
                    "text-xs sm:text-sm flex-1 p-2 sm:p-3 rounded border transition-all",
                    isSelected && isCorrectOption
                      ? "bg-success/10 border-success/30 text-foreground font-medium"
                      : isSelected && !isCorrectOption
                      ? "bg-destructive/10 border-destructive/30 text-foreground font-medium"
                      : !isSelected && isCorrectOption
                      ? "bg-warning/10 border-warning/30 text-foreground"
                      : "bg-muted/30 border-muted text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-mono text-2xs sm:text-xs bg-background px-1 sm:px-1.5 py-0.5 rounded border shrink-0">
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    <span className="flex-1 break-words">
                      {option.optionText}
                    </span>
                    {isSelected && (
                      <Badge
                        size="sm"
                        variant="secondary"
                        className={cn(
                          "text-2xs sm:text-xs px-1.5 py-0.5 shrink-0 whitespace-nowrap",
                          isCorrectOption
                            ? "bg-success/20 text-success border-success/40"
                            : "bg-destructive/20 text-destructive border-destructive/40"
                        )}
                      >
                        {t("option_selected")}
                      </Badge>
                    )}
                    {!isSelected && isCorrectOption && (
                      <Badge
                        size="sm"
                        variant="outline"
                        className="text-2xs sm:text-xs bg-warning/10 text-warning border-warning/30 px-1.5 py-0.5 shrink-0 whitespace-nowrap"
                      >
                        {t("correct_answer_label")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
