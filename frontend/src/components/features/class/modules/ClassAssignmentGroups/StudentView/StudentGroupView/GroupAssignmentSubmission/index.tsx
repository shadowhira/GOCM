"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useCurrentUser } from "@/store/auth/useAuthStore";

// Types
import type { AssignmentResponse } from "@/types/assignment";
import type { AssignmentGroupResponse } from "@/types/assignmentGroup";

// Custom Hook
import { useAssignmentSubmission } from "../../../../ClassAssignments/AssignmentDetail/AssignmentSubmission/hooks/useAssignmentSubmission";

// Components
import { SubmissionHeader } from "../../../../ClassAssignments/AssignmentDetail/AssignmentSubmission/SubmissionHeader";
import { SubmissionNotAllowed } from "../../../../ClassAssignments/AssignmentDetail/AssignmentSubmission/SubmissionNotAllowed";
import { SubmissionSuccess } from "../../../../ClassAssignments/AssignmentDetail/AssignmentSubmission/SubmissionSuccess";
import { SubmissionHistory } from "../../../../ClassAssignments/AssignmentDetail/AssignmentSubmission/SubmissionHistory";
import { SubmissionForm } from "../../../../ClassAssignments/AssignmentDetail/AssignmentSubmission/SubmissionForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface GroupAssignmentSubmissionProps {
  assignment: AssignmentResponse;
  classId: number;
  group: AssignmentGroupResponse;
  onSubmissionComplete?: () => void;
}

export function GroupAssignmentSubmission({
  assignment,
  classId,
  group,
  onSubmissionComplete,
}: GroupAssignmentSubmissionProps) {
  const t = useTranslations();
  const user = useCurrentUser();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Check if current user is leader
  const currentUserMember = group.groupMembers?.find(m => m.member.userId === user?.id);
  const isLeader = currentUserMember?.isLeader || false;

  const {
    submissionText,
    setSubmissionText,
    uploadedFiles,
    setUploadedFiles,
    isSubmitting,
    submissionData,
    showSubmissionHistory,
    setShowSubmissionHistory,
    hasSubmitted,
    isOverdue,
    canSubmit: hookCanSubmit,
    submissionFiles,
    isEditMode,
    handleSubmit,
    handleCancelSubmission,
    handleEditSubmission,
    handleCancelEdit,
    buildFormData,
  } = useAssignmentSubmission({
    assignment,
    classId,
    isTeacher: false,
    onSubmissionComplete,
  });

  // Override canSubmit based on leadership
  const canSubmit = hookCanSubmit && isLeader;

  const onConfirmCancel = async () => {
    await handleCancelSubmission();
    setShowCancelDialog(false);
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header */}
      <SubmissionHeader
        hasSubmitted={hasSubmitted}
        isOverdue={isOverdue}
        deadline={assignment.deadline}
      />

      {/* Not Allowed Message (if overdue or not allowed by system) */}
      {!hookCanSubmit && !hasSubmitted && (
        <SubmissionNotAllowed
          isOverdue={isOverdue}
          hasSubmitted={hasSubmitted}
        />
      )}

      {/* Leader Restriction Message - Show if user can submit (system-wise) but is not leader */}
      {!isLeader && !hasSubmitted && hookCanSubmit && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t("group_submission_restriction")}</AlertTitle>
          <AlertDescription>
            {t("only_leader_can_submit")}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {hasSubmitted && submissionData?.submittedTime && (
        <SubmissionSuccess
          submittedAt={submissionData.submittedTime}
          onViewDetails={() => setShowSubmissionHistory(!showSubmissionHistory)}
          showDetails={showSubmissionHistory}
        />
      )}

      {/* Submission History - Visible to all members */}
      {showSubmissionHistory &&
        hasSubmitted &&
        submissionData &&
        submissionData.submittedTime &&
        !isEditMode && (
          <SubmissionHistory
            submittedAt={submissionData.submittedTime}
            submittedContent={submissionData.content || ""}
            submittedFiles={submissionFiles}
          />
        )}

      {/* Action Buttons for Submitted Assignment - Only for Leader */}
      {hasSubmitted && !isOverdue && submissionData?.status === 1 && !isEditMode && isLeader && (
        <div className="flex gap-3 justify-end">
          <Button
            onClick={handleEditSubmission}
            variant="default"
            size="default"
            className="font-medium"
          >
            {t("edit")}
          </Button>
          <Button
            onClick={() => setShowCancelDialog(true)}
            variant="destructive"
            size="default"
            className="font-medium"
          >
            {t("cancel")}
          </Button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-3">{t("confirm_cancel_submission")}</h3>
            <p className="text-muted-foreground mb-6">
              {t("confirm_cancel_submission_message")}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowCancelDialog(false)}
                variant="outline"
                size="default"
              >
                {t("no")}
              </Button>
              <Button
                onClick={onConfirmCancel}
                variant="destructive"
                size="default"
              >
                {t("confirm_cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submission Form - Only for Leader */}
      {((canSubmit && !hasSubmitted) || isEditMode) && isLeader ? (
        <SubmissionForm
          submissionText={submissionText}
          onSubmissionTextChange={setSubmissionText}
          uploadedFilesCount={uploadedFiles.length}
          onFilesChange={setUploadedFiles}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          uploadEndpoint="/Document"
          classId={classId}
          canSubmit={canSubmit || isEditMode}
          buildFormData={buildFormData}
          isEditMode={isEditMode}
          onCancelEdit={isEditMode ? handleCancelEdit : undefined}
          uploadedFiles={uploadedFiles}
        />
      ) : null}
    </Card>
  );
}
