"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { useGetSubmissionById } from "@/queries/submissionQueries";
import { useGetAssignmentFullForTeacher } from "@/queries/assignmentQueries";
import { useGetClassById } from "@/queries/classQueries";
import { useCurrentUser } from "@/store/auth";
import { AssignmentType } from "@/types/constants";
import { RoleInClass } from "@/types/class";
import {
  quizSubmissionStatsSchema,
  type QuizSubmissionStats,
} from "@/schemas/submissionSchema";
import { EssaySubmissionDetailContent } from "./EssaySubmissionDetailContent";
import { QuizSubmissionDetailContent } from "./QuizSubmissionDetailContent";
import { useClassCosmeticsBootstrap } from "@/hooks/useClassCosmeticsBootstrap";


interface SubmissionDetailProps {
  assignmentId: number;
  submissionId: number;
  classId: number;
}

export const SubmissionDetail = ({
  assignmentId,
  submissionId,
  classId,
}: SubmissionDetailProps) => {
  const pathname = usePathname();
  const t = useTranslations();
  useClassCosmeticsBootstrap(classId);

  // Extract locale và build back URL
  const locale = pathname.split("/")[1];
  const backUrl = `/${locale}/class/${classId}/assignments/${assignmentId}?tab=submissions`;

  // Get current user and class data for role check
  const currentUser = useCurrentUser();
  const { data: classData } = useGetClassById(classId);
  
  const isOwner = classData?.createdByUserId === currentUser?.id;
  const isTeacher = classData?.userRoleInClass === RoleInClass.TEACHER || isOwner;

  // Fetch data
  const {
    data: submissionData,
    isLoading: submissionLoading,
    error: submissionError,
  } = useGetSubmissionById(submissionId);

  const {
    data: assignmentData,
    isLoading: assignmentLoading,
    error: assignmentError,
  } = useGetAssignmentFullForTeacher(classId, assignmentId);

  const isLoading = submissionLoading || assignmentLoading;
  const hasError = submissionError || assignmentError;

  // Sử dụng data trực tiếp
  const submission = submissionData;
  const assignment = assignmentData;

  // Tính toán statistics với Zod validation
  const stats: QuizSubmissionStats | null = useMemo(() => {
    if (!submission || !assignment) return null;

    const questions = assignment.listQuestions || [];
    const answers = submission.answers || [];
    const totalQuestions = questions.length;
    const answeredQuestions = answers.length;
    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const incorrectAnswers = answeredQuestions - correctAnswers;
    const accuracyRate =
      answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;

    try {
      return quizSubmissionStatsSchema.parse({
        totalQuestions,
        answeredQuestions,
        correctAnswers,
        incorrectAnswers,
        accuracyRate,
      });
    } catch (error) {
      console.error("Stats validation error:", error);
      return null;
    }
  }, [submission, assignment]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">{t("loading")}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError || !submission || !assignment) {
    return (
      <Card className="p-8 text-center">
        <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("failed_to_load_submission_detail")}
        </h3>
        <p className="text-muted-foreground mb-4">{t("error_occurred")}</p>
        <BackButton href={backUrl} />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton href={backUrl} />
      <Card>
        {/* Header Section */}
        <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {assignment.type === AssignmentType.Essay
                  ? t("essay_submission_detail_title")
                  : t("quiz_submission_detail_title")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {assignment.title}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Render Essay submission detail */}
          {assignment.type === AssignmentType.Essay && (
            <EssaySubmissionDetailContent
              submission={submission}
              assignment={assignment}
              classId={classId}
              assignmentId={assignmentId}
              isTeacher={Boolean(isTeacher)}
            />
          )}

          {/* Render Quiz submission detail */}
          {assignment.type === AssignmentType.Quiz && (
            <QuizSubmissionDetailContent
              submission={submission}
              assignment={assignment}
              stats={stats}
              classId={classId}
              assignmentId={assignmentId}
              isTeacher={Boolean(isTeacher)}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

// Export default
export default SubmissionDetail;
