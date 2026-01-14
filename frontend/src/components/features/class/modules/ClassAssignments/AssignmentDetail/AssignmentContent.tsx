"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import type {
  AssignmentResponse,
  AttachmentResponse,
} from "@/types/assignment";
import { AssignmentType, FileType } from "@/types/constants";
import { QuizNavigator } from "./QuizSubmission/QuizNavigator";
import { QuizNavigatorSheet } from "./QuizSubmission/QuizNavigatorSheet";

interface AssignmentContentProps {
  assignment: AssignmentResponse;
  isTeacher?: boolean;
}

export const AssignmentContent = ({
  assignment,
  isTeacher = false,
}: AssignmentContentProps) => {
  const t = useTranslations();
  const [currentQuestion, setCurrentQuestion] = React.useState(1);
  const questionRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  // For teacher view, use empty Set (no "answered" styling)
  // For student view, this would contain answered questions
  const answeredQuestionsSet = React.useMemo(() => {
    return new Set<number>();
  }, []);

  const handlePreview = (attachment: AttachmentResponse) => {
    if (attachment.publicUrl) {
      window.open(attachment.publicUrl, "_blank");
    }
  };

  const scrollToQuestion = React.useCallback((index: number) => {
    const questionElement = questionRefs.current[index];
    if (questionElement) {
      questionElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setCurrentQuestion(index + 1);
    }
  }, []);

  // Remove auto-scroll tracking for teacher view to prevent jumping
  // Only update currentQuestion when user clicks on a question number

  const getFileTypeColor = (fileType: number) => {
    switch (fileType) {
      case 0: // PDF
        return "bg-destructive/20 text-destructive border-destructive/40";
      case 1: // Word
        return "bg-primary/20 text-primary border-primary/40";
      case 2: // Excel
        return "bg-success/20 text-success border-success/40";
      case 3: // PowerPoint
        return "bg-warning/20 text-warning border-warning/40";
      case 4: // Image
        return "bg-accent/20 text-accent-foreground border-accent/40";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/40";
    }
  };

  return (
    <div className="space-y-6">
      {/* Assignment Description */}
      {assignment.content && (
        <Card className="p-6 shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {t("description")}
            </h2>
          </div>
          <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
            <div dangerouslySetInnerHTML={{ __html: assignment.content }} />
          </div>
        </Card>
      )}

      {/* Attachments */}
      {assignment.attachments && assignment.attachments.length > 0 && (
        <Card className="p-6 shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              {t("attachments")}
            </h2>
            <Badge variant="secondary" className="ml-2">
              {assignment.attachments.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assignment.attachments.map((attachment) => (
              <div
                key={attachment.id}
                onClick={() => handlePreview(attachment)}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <Badge
                  variant="outline"
                  className={`${getFileTypeColor(
                    attachment.fileType
                  )} shrink-0`}
                >
                  {FileType[attachment.fileType]}
                </Badge>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("updated_at")}:{" "}
                    {new Date(attachment.updatedAt.includes('Z') || attachment.updatedAt.includes('+') ? attachment.updatedAt : attachment.updatedAt + 'Z').toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quiz Questions - For Teachers */}
      {isTeacher &&
        assignment.type === AssignmentType.Quiz &&
        assignment.listQuestions &&
        assignment.listQuestions.length > 0 && (
          <Card className="p-6 shadow-sm border">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                {t("quiz_questions_teacher")}
              </h2>
              <Badge variant="secondary" className="ml-2">
                {assignment.listQuestions.length} {t("questions")}
              </Badge>
            </div>

            <div className="flex gap-6">
              {/* Questions List */}
              <div className="flex-1 space-y-6">
                {assignment.listQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    ref={(el) => {
                      questionRefs.current[index] = el;
                    }}
                    className="border-l-4 border-primary pl-4 scroll-mt-6"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-sm font-medium rounded-full shrink-0">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground mb-2">
                          {question.questionText}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {question.questionType === 0
                              ? t("single_choice")
                              : t("multiple_choice")}
                          </Badge>
                          <Badge variant="secondary" className="text-xs font-semibold">
                            {question.point} {t("points_lower")}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 ml-9">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={option.id}
                          className={`flex items-center gap-2 p-2 rounded border ${option.isCorrect
                            ? "bg-success/10 border-success/40 text-success"
                            : "bg-muted/30"
                            }`}
                        >
                          <span className="text-sm text-muted-foreground font-mono">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span className="text-sm flex-1">
                            {option.optionText}
                          </span>
                          {option.isCorrect && (
                            <Badge
                              variant="secondary"
                              className="bg-success/20 text-success border-success/40 text-xs"
                            >
                              {t("correct_answer")}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quiz Navigator - Desktop: Sidebar */}
              <div className="hidden lg:block lg:w-80">
                <QuizNavigator
                  totalQuestions={assignment.listQuestions.length}
                  answeredQuestions={answeredQuestionsSet}
                  currentQuestion={currentQuestion}
                  onQuestionClick={scrollToQuestion}
                  onSubmit={() => { }} // No submit for teacher view
                  isSubmitting={false}
                  canSubmit={false}
                  t={t}
                  isTeacher={true}
                />
              </div>

              {/* Quiz Navigator - Mobile/Tablet: Floating Button */}
              <QuizNavigatorSheet
                totalQuestions={assignment.listQuestions.length}
                answeredQuestions={answeredQuestionsSet}
                currentQuestion={currentQuestion}
                onQuestionClick={scrollToQuestion}
                onSubmit={() => { }}
                isSubmitting={false}
                canSubmit={false}
                t={t}
                isTeacher={true}
              />
            </div>
          </Card>
        )}

      {/* Empty State */}
      {/* {!assignment.content &&
        (!assignment.attachments || assignment.attachments.length === 0) &&
        !(
          isTeacher &&
          assignment.type === AssignmentType.Quiz &&
          assignment.listQuestions &&
          assignment.listQuestions.length > 0
        ) && (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t("no_content_available")}</p>
          </Card>
        )} */}
    </div>
  );
};
