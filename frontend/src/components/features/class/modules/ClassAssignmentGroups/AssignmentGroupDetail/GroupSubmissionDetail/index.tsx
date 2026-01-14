"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { useGetSubmissionById } from "@/queries/submissionQueries";
import { useGetAssignmentFullForTeacher } from "@/queries/assignmentQueries";
import { useGetAssignmentGroupTopicByGroupId } from "@/queries/assignmentGroupTopicQueries";
import { AssignmentType } from "@/types/constants";

import { GroupSubmissionDetailContent } from "./GroupSubmissionDetailContent";
import { GroupInfoCard } from "./GroupInfoCard";
import { GradingSection } from "./GradingSection";
import { GroupSubmissionHeader } from "./GroupSubmissionHeader";


interface GroupSubmissionDetailProps {
  assignmentId: number;
  submissionId: number;
  classId: number;
}

export const GroupSubmissionDetail = ({
  assignmentId,
  submissionId,
  classId,
}: GroupSubmissionDetailProps) => {
  const pathname = usePathname();
  const t = useTranslations();

  // Extract locale và build back URL
  const locale = pathname.split("/")[1];
  const backUrl = `/${locale}/class/${classId}/assignment-groups/${assignmentId}?tab=submissions`;

  // Fetch data
  const {
    data: submission,
    isLoading: submissionLoading,
    error: submissionError,
  } = useGetSubmissionById(submissionId);

  const {
    data: assignment,
    isLoading: assignmentLoading,
    error: assignmentError,
  } = useGetAssignmentFullForTeacher(classId, assignmentId);

  const group = submission?.assignmentGroup;

  // Fetch Topic Info
  const {
    data: topic,
    isLoading: topicLoading,
  } = useGetAssignmentGroupTopicByGroupId(group?.id || 0, {
    enabled: !!group?.id,
  });

  const isLoading = submissionLoading || assignmentLoading || topicLoading;
  const hasError = submissionError || assignmentError;



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
        {/* Header Section - giống ClassAssignments */}
        <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {t("group_submission_detail")}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {assignment.title}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Group & Submission Info - giống SubmissionHeader của ClassAssignments */}
          <Card className="p-4 sm:p-6">
            <GroupSubmissionHeader
              group={group || undefined}
              submittedTime={submission.submittedTime}
              status={submission.status}
              grade={submission.grade}
              maxScore={assignment.maxScore}
            />
          </Card>

          {/* Group Members Info */}
          {group && (
            <GroupInfoCard group={group} topic={topic} />
          )}

          {/* Submission Content */}
          {(assignment.type === AssignmentType.Essay || assignment.type === AssignmentType.Group) && (
            <GroupSubmissionDetailContent
              submission={submission}
              assignment={assignment}
            />
          )}

          {/* Grading Section */}
          {submission.status !== 0 && (
            <GradingSection
              submissionId={submissionId}
              maxScore={assignment.maxScore}
              currentGrade={submission.grade}
            />
          )}
        </div>
      </Card>
    </div>
  );
};

// Export default
export default GroupSubmissionDetail;
