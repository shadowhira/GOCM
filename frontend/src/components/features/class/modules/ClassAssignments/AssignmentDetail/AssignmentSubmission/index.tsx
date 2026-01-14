"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

// Types
import type { AssignmentResponse } from "@/types/assignment";

// Custom Hook
import { useAssignmentSubmission } from "./hooks/useAssignmentSubmission";

// Components
import { SubmissionHeader } from "./SubmissionHeader";
import { SubmissionNotAllowed } from "./SubmissionNotAllowed";
import { SubmissionSuccess } from "./SubmissionSuccess";
import { SubmissionHistory } from "./SubmissionHistory";
import { SubmissionForm } from "./SubmissionForm";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AssignmentSubmissionProps {
  assignment: AssignmentResponse;
  classId: number;
  isTeacher?: boolean;
  onSubmissionComplete?: () => void;
}

export function AssignmentSubmission({
  assignment,
  classId,
  isTeacher = false,
  onSubmissionComplete,
}: AssignmentSubmissionProps) {
  const t = useTranslations();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

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
    canSubmit,
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
    isTeacher,
    onSubmissionComplete,
  });

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

      {/* Not Allowed Message */}
      {!canSubmit && !hasSubmitted && (
        <SubmissionNotAllowed
          isOverdue={isOverdue}
          hasSubmitted={hasSubmitted}
        />
      )}

      {/* Success Message */}
      {hasSubmitted && submissionData?.submittedTime && (
        <SubmissionSuccess
          submittedAt={submissionData.submittedTime}
          onViewDetails={() => setShowSubmissionHistory(!showSubmissionHistory)}
          showDetails={showSubmissionHistory}
        />
      )}

      {/* Submission History */}
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

      {/* Action Buttons for Submitted Assignment */}
      {hasSubmitted && !isOverdue && submissionData?.status === 1 && !isEditMode && (
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

      {/* Submission Form - For new submission or edit mode */}
      {(canSubmit && !hasSubmitted) || isEditMode ? (
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
