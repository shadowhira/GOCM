import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { cn, parseBackendDateTime } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { QuizQuestionResponse } from "@/types/quiz";
import { QuestionType } from "@/types/constants";
import { QuizNavigator } from "./QuizNavigator";
import { useState } from "react";

interface QuizSubmissionHistoryProps {
  questions: QuizQuestionResponse[];
  getSubmittedAnswerForQuestion: (questionId: number) => number[];
  submittedTime?: Date;
  totalSelectedOptions: number;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function QuizSubmissionHistory({
  questions,
  getSubmittedAnswerForQuestion,
  submittedTime,
  totalSelectedOptions,
  t,
}: QuizSubmissionHistoryProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Build answered questions set
  const answeredQuestions = new Set<number>(
    questions
      .map((q, index) =>
        getSubmittedAnswerForQuestion(q.id).length > 0 ? index + 1 : null
      )
      .filter((n): n is number => n !== null)
  );

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
    // Scroll to question
    const questionElement = document.getElementById(`question-${index}`);
    questionElement?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    // eslint-disable-next-line design-system/use-design-tokens
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 sm:gap-6">
      {/* Main content */}
      <div>
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-success" />
            <h3 className="font-medium text-foreground">
              {t("submission_history")}
            </h3>
            <Badge
              variant="outline"
              className="bg-success/10 text-success border-success/30"
            >
              {t("completed")}
            </Badge>
          </div>

          {/* Submission metadata */}
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg bg-background/50 border">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">
                {t("submission_time")}:
              </span>
              <span className="font-medium text-foreground">
                {submittedTime &&
                  format(parseBackendDateTime(String(submittedTime)) || new Date(submittedTime), "dd/MM/yyyy - HH:mm", {
                    locale: vi,
                  })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm mt-1.5 sm:mt-2">
              <span className="text-muted-foreground">
                {t("questions_answered")}:
              </span>
              <span className="font-medium text-foreground">
                {
                  questions.filter(
                    (q) => getSubmittedAnswerForQuestion(q.id).length > 0
                  ).length
                }{" "}
                / {questions.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm mt-1.5 sm:mt-2">
              <span className="text-muted-foreground">
                {t("total_selected_options")}:
              </span>
              <span className="font-medium text-foreground">
                {totalSelectedOptions} {t("options_count")}
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {questions.map((question, index) => {
              const selectedOptions = getSubmittedAnswerForQuestion(
                question.id
              );

              return (
                <div
                  key={question.id}
                  id={`question-${index}`}
                  className={cn(
                    "p-3 sm:p-4 rounded-lg bg-background border",
                    selectedOptions.length > 0
                      ? "border-l-4 border-l-success"
                      : "border-l-4 border-l-muted"
                  )}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span
                      className={cn(
                        "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm font-bold rounded-full shrink-0 border-2",
                        selectedOptions.length > 0
                          ? "bg-background text-success border-success"
                          : "bg-muted text-muted-foreground border-muted"
                      )}
                    >
                      {selectedOptions.length > 0 ? (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <h3 className="font-medium text-foreground text-sm sm:text-base break-words">
                          {t("question_number")} {index + 1}:{" "}
                          {question.questionText}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                        <Badge
                          variant="outline"
                          className="text-2xs sm:text-xs px-1.5 sm:px-2 py-0.5"
                        >
                          {question.questionType === QuestionType.SingleChoice
                            ? t("single_choice")
                            : t("multiple_choice")}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-2xs sm:text-xs px-1.5 sm:px-2 py-0.5 font-semibold"
                        >
                          {question.point} {t("points_lower")}
                        </Badge>
                        {selectedOptions.length > 0 ? (
                          <Badge
                            variant="secondary"
                            className="bg-success/10 text-success border-success/30 text-2xs sm:text-xs px-1.5 sm:px-2 py-0.5"
                          >
                            {t("answered_with_count", {
                              count: selectedOptions.length,
                            })}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted/10 text-muted-foreground border-muted text-2xs sm:text-xs px-1.5 sm:px-2 py-0.5"
                          >
                            {t("not_answered")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-7 sm:ml-9 space-y-2 sm:space-y-3">
                    {question.options.map((option, optionIndex) => {
                      const isSelected = selectedOptions.includes(option.id);

                      return (
                        <div
                          key={option.id}
                          className="flex items-center space-x-2 sm:space-x-3"
                        >
                          {/* Check icon for selected answer */}
                          <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0">
                            {isSelected ? (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                            ) : (
                              <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-muted" />
                            )}
                          </div>
                          <div
                            className={cn(
                              "text-xs sm:text-sm flex-1 p-2 sm:p-3 rounded border transition-all",
                              isSelected
                                ? "bg-background border-border text-foreground font-medium"
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
                                  variant="secondary"
                                  className="bg-success/20 text-success border-success/40 text-2xs sm:text-xs px-1.5 py-0.5 shrink-0"
                                >
                                  {t("selected")}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Quiz Navigator Sidebar */}
      <div className="hidden lg:block">
        <QuizNavigator
          totalQuestions={questions.length}
          answeredQuestions={answeredQuestions}
          currentQuestion={currentQuestionIndex + 1}
          onQuestionClick={handleQuestionClick}
          onSubmit={() => {}}
          isSubmitting={false}
          canSubmit={false}
          t={t}
        />
      </div>
    </div>
  );
}
