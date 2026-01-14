"use client";

import React, { useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssignmentResponse } from "@/types/assignment";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseBackendDateTime } from "@/lib/utils";

// Sub-components
import { QuizStatusBadge } from "./QuizStatusBadge";
import { QuizNotAllowed } from "./QuizNotAllowed";
import { QuizSubmittedSummary } from "./QuizSubmittedSummary";
import { QuizSubmissionHistory } from "./QuizSubmissionHistory";
import { QuizQuestionCard } from "./QuizQuestionCard";
import { QuizEmptyState } from "./QuizEmptyState";
import { ScrollToBottom } from "./ScrollToBottom";
import { QuizNavigator } from "./QuizNavigator";
import { QuizNavigatorSheet } from "./QuizNavigatorSheet";

// Custom hooks
import { useQuizAnswers } from "./hooks/useQuizAnswers";
import { useQuizSubmissionState } from "./hooks/useQuizSubmissionState";
import { useQuizSubmit } from "./hooks/useQuizSubmit";

interface QuizSubmissionProps {
  assignment: AssignmentResponse;
  classId: number;
  isTeacher?: boolean;
  onSubmissionComplete?: () => void;
}

export function QuizSubmission({
  assignment,
  classId,
  isTeacher = false,
  onSubmissionComplete,
}: QuizSubmissionProps) {
  const t = useTranslations();
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentQuestion, setCurrentQuestion] = React.useState(1);

  // Use custom hooks for state management
  const {
    submissionStatus,
    setSubmissionStatus,
    setShowResults,
    showAnswers,
    setShowAnswers,
    setSubmissionData,
    hasSubmitted,
    isOverdue,
    canSubmit,
    questions,
    activeSubmission,
    hasAnswers,
    totalSelectedOptions,
    shouldShowHistory,
    getSubmittedAnswerForQuestion,
  } = useQuizSubmissionState({
    assignment,
    classId,
    isTeacher,
  });

  // Use custom hook for answer management with localStorage persistence
  const {
    answers,
    handleSingleChoiceChange,
    handleMultipleChoiceChange,
    getAnswerForQuestion,
    isQuestionAnswered,
  } = useQuizAnswers({
    assignmentId: assignment.id,
    classId,
    hasSubmitted,
  });

  // Use custom hook for submission
  const { handleSubmit: submitQuiz, isSubmitting } = useQuizSubmit({
    classId,
    assignmentId: assignment.id,
    assignmentDeadline: assignment.deadline,
    isTeacher,
    onSubmissionComplete,
    setSubmissionStatus,
    setSubmissionData,
    setShowResults,
  });

  // Get answered questions as a Set for QuizNavigator
  const answeredQuestionsSet = useMemo(() => {
    const set = new Set<number>();
    questions.forEach((q, index) => {
      if (isQuestionAnswered(q.id)) {
        set.add(index + 1); // 1-based index
      }
    });
    return set;
  }, [questions, isQuestionAnswered]);

  const handleSubmit = async () => {
    await submitQuiz(answers);
  };

  const scrollToQuestion = (index: number) => {
    const questionElement = questionRefs.current[index];
    if (questionElement) {
      questionElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setCurrentQuestion(index + 1); // Set 1-based index
    }
  };

  const formatDeadline = (deadline: Date | string) => {
    try {
      const parsed = typeof deadline === 'string' 
        ? parseBackendDateTime(deadline) 
        : parseBackendDateTime(deadline.toISOString());
      if (!parsed) return String(deadline);
      return format(parsed, "dd/MM/yyyy - HH:mm", {
        locale: vi,
      });
    } catch {
      return String(deadline);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <Card className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              {t("quiz_submission")}
            </h2>
            <QuizStatusBadge
              submissionStatus={submissionStatus}
              hasSubmitted={hasSubmitted}
              isOverdue={isOverdue}
              t={t}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {t("deadline")}:{" "}
            <span className={cn(isOverdue && "text-destructive font-medium")}>
              {formatDeadline(assignment.deadline)}
            </span>
          </div>
        </div>

        {/* Not Allowed Message */}
        {!canSubmit && !hasSubmitted && (
          <QuizNotAllowed isOverdue={isOverdue} t={t} />
        )}

        {/* Submitted Summary */}
        {hasSubmitted && (
          <QuizSubmittedSummary
            submittedTime={activeSubmission?.submittedTime}
            hasAnswers={hasAnswers}
            showAnswers={showAnswers}
            onToggleAnswers={() => setShowAnswers((v) => !v)}
            assignment={assignment}
            classId={classId}
            submissionId={activeSubmission?.id}
            t={t}
          />
        )}

        {/* Submission History */}
        {shouldShowHistory && (
          <QuizSubmissionHistory
            questions={questions}
            getSubmittedAnswerForQuestion={getSubmittedAnswerForQuestion}
            submittedTime={activeSubmission?.submittedTime}
            totalSelectedOptions={totalSelectedOptions}
            t={t}
          />
        )}

        {/* Quiz Questions */}
        {!hasSubmitted && questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div
                key={question.id}
                ref={(el) => {
                  questionRefs.current[index] = el;
                }}
              >
                <QuizQuestionCard
                  question={question}
                  index={index}
                  selectedOptions={getAnswerForQuestion(question.id)}
                  onSingleChoiceChange={(optionId) =>
                    handleSingleChoiceChange(question.id, optionId)
                  }
                  onMultipleChoiceChange={(optionId, checked) =>
                    handleMultipleChoiceChange(question.id, optionId, checked)
                  }
                  canSubmit={canSubmit}
                  t={t}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {questions.length === 0 && <QuizEmptyState t={t} />}

        {/* Scroll to Bottom Button */}
        <ScrollToBottom />
      </Card>

      {/* Quiz Navigator - Sticky Sidebar (Desktop Only) */}
      {!hasSubmitted && questions.length > 0 && (
        <>
          {/* Desktop: Sidebar */}
          <div className="hidden lg:block lg:w-80">
            <QuizNavigator
              totalQuestions={questions.length}
              answeredQuestions={answeredQuestionsSet}
              currentQuestion={currentQuestion}
              onQuestionClick={scrollToQuestion}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              canSubmit={canSubmit}
              t={t}
              isTeacher={isTeacher}
            />
          </div>

          {/* Mobile/Tablet: Floating Button + Bottom Sheet */}
          <QuizNavigatorSheet
            totalQuestions={questions.length}
            answeredQuestions={answeredQuestionsSet}
            currentQuestion={currentQuestion}
            onQuestionClick={scrollToQuestion}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            canSubmit={canSubmit}
            t={t}
            isTeacher={isTeacher}
          />
        </>
      )}
    </div>
  );
}
