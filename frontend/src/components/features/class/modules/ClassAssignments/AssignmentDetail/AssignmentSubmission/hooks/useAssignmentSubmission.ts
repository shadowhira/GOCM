import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { AxiosError } from "axios";

import type { AssignmentResponse } from "@/types/assignment";
import {
  AssignmentType,
  AssignmentStatus,
  ParentType,
} from "@/types/constants";
import type {
  CreateSubmissionRequest,
  CreateSubmissionResponse,
  SubmissionResponse,
} from "@/types/submission";
import { SubmissionStatus } from "@/types/submission";
import type { UploadedFileItem } from "@/components/features/uploadFile/FileUpload";
import {
  useCreateSubmission,
  useUpdateSubmission,
  useCancelSubmission,
  submissionKeys,
} from "@/queries/submissionQueries";
import { buildCreateSubmissionSchema } from "@/schemas/submissionSchema";
import {
  RewardPointRules,
  formatRewardPoints,
} from "@/config/rewardPointRules";

interface UseAssignmentSubmissionProps {
  assignment: AssignmentResponse;
  classId: number;
  isTeacher?: boolean;
  onSubmissionComplete?: () => void;
}

export function useAssignmentSubmission({
  assignment,
  classId,
  isTeacher = false,
  onSubmissionComplete,
}: UseAssignmentSubmissionProps) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const createSubmission = useCreateSubmission();
  const updateSubmission = useUpdateSubmission();
  const cancelSubmission = useCancelSubmission();

  const [submissionText, setSubmissionText] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus | null>(null);
  const [submissionData, setSubmissionData] =
    useState<CreateSubmissionResponse | null>(null);
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(
    !isTeacher
  );
  const [hasExplicitlyCancelled, setHasExplicitlyCancelled] = useState(false);
  // Track if user has cancelled and resubmitted - prevents showing reward toast on resubmission
  const [hasCancelledAndResubmitted, setHasCancelledAndResubmitted] = useState(false);
  // Track if there was an existing submission when component mounted (for detecting resubmission scenario)
  const [hadSubmissionOnMount, setHadSubmissionOnMount] = useState(false);

  // Get submission data from prefetched SSR cache
  // This will be null after cancelSubmission removes the cache
  const existingSubmissionData = useMemo(() => {
    if (isTeacher) return null;
    // If user explicitly cancelled, don't check cache
    if (hasExplicitlyCancelled) return null;
    return queryClient.getQueryData<CreateSubmissionResponse>([
      ...submissionKeys.byAssignmentAndClass(classId, assignment.id),
      "student-safe",
    ]);
  }, [queryClient, classId, assignment.id, isTeacher, hasExplicitlyCancelled]);

  // Track if there was a submission when component first mounted
  // This helps detect the scenario where user reloads page after cancelling
  useEffect(() => {
    if (existingSubmissionData && !hadSubmissionOnMount) {
      setHadSubmissionOnMount(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Check hasSubmitted from both local state and existingSubmissionData
  // Priority: local state (after cancel, submissionStatus will be null)
  const hasSubmitted = useMemo(() => {
    // If user explicitly cancelled, return false
    if (hasExplicitlyCancelled) {
      return false;
    }
    const localSubmitted =
      submissionStatus === SubmissionStatus.Submitted ||
      submissionStatus === SubmissionStatus.Graded;
    const existingSubmitted =
      existingSubmissionData?.status === SubmissionStatus.Submitted ||
      existingSubmissionData?.status === SubmissionStatus.Graded;
    return localSubmitted || existingSubmitted;
  }, [submissionStatus, existingSubmissionData?.status, hasExplicitlyCancelled]);

  // Update submission status and data when existing submission is found
  useEffect(() => {
    if (existingSubmissionData && !isTeacher && !hasExplicitlyCancelled) {
      setSubmissionStatus(existingSubmissionData.status);
      setSubmissionData(existingSubmissionData);
      // Load existing submission data into form when in edit mode
      if (isEditMode) {
        setSubmissionText(existingSubmissionData.content || "");
        // Map existing files to uploaded files format
        const existingFiles: UploadedFileItem[] = existingSubmissionData.submittedFiles?.map(doc => ({
          id: doc.id.toString(),
          fileName: doc.fileName,
          publicUrl: doc.publicUrl || "",
          documentId: doc.id,
        })) || [];
        setUploadedFiles(existingFiles);
      }
    }
  }, [existingSubmissionData, isTeacher, isEditMode, hasExplicitlyCancelled]);

  // Check if assignment is overdue
  const isOverdue =
    assignment.status === AssignmentStatus.Expired ||
    new Date(assignment.deadline) < new Date();

  const canSubmit =
    !isOverdue &&
    !hasSubmitted &&
    assignment.status === AssignmentStatus.Assigned;

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const documentIds = uploadedFiles
        .map((f) => f.documentId)
        .filter((id): id is number => id !== undefined);

      if (isEditMode && submissionData?.id) {
        // Update existing submission
        const updated = await updateSubmission.mutateAsync({
          classId,
          assignmentId: assignment.id,
          data: {
            id: submissionData.id,
            content: submissionText || undefined,
            documentIds,
          },
        });

        setSubmissionStatus(updated.status);
        setSubmissionData(updated as SubmissionResponse);
        setIsEditMode(false);
        setHasExplicitlyCancelled(false); // Reset flag after successful update
        toast.success(t("submission_updated_successfully"));
        onSubmissionComplete?.();
      } else {
        // Create new submission
        const payload: CreateSubmissionRequest = {
          content: submissionText || undefined,
          documentIds,
          answers: [],
        };

        const schema = buildCreateSubmissionSchema(AssignmentType.Essay);
        schema.parse(payload);

        const created = await createSubmission.mutateAsync({
          classId,
          assignmentId: assignment.id,
          data: payload,
        });

        setSubmissionStatus(created.status);
        setSubmissionData(created);
        // Only show reward toast if this is first submission (not a resubmission after cancel)
        if (!hasCancelledAndResubmitted) {
          maybeShowOnTimeRewardToast(created.submittedTime);
        }
        setHasExplicitlyCancelled(false); // Reset flag after successful submission
        onSubmissionComplete?.();
      }
    } catch (error) {
      const axiosErr = error as AxiosError<unknown>;
      const payload = axiosErr?.response?.data as
        | Record<string, unknown>
        | undefined;
      const code = typeof payload?.code === "number" ? payload.code : undefined;
      const errors = Array.isArray(payload?.errors)
        ? payload.errors
        : undefined;

      const isAlreadySubmitted =
        code === 3 ||
        errors?.some(
          (e) =>
            e.toLowerCase().includes("submitted") ||
            e.toLowerCase().includes("nộp bài")
        );

      if (isAlreadySubmitted) {
        setSubmissionStatus(SubmissionStatus.Submitted);
        toast.info(t("already_submitted_assignment"));
      } else {
        console.error("Submission failed:", error);
        toast.error(isEditMode ? t("update_submission_failed") : t("submission_failed"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmission = async () => {
    if (!submissionData?.id) return;

    try {
      await cancelSubmission.mutateAsync({
        assignmentId: assignment.id,
        submissionId: submissionData.id,
        classId,
      });

      // Reset all state to initial values
      setSubmissionStatus(null);
      setSubmissionData(null);
      setSubmissionText("");
      setUploadedFiles([]);
      setIsEditMode(false);
      setShowSubmissionHistory(false);
      setHasExplicitlyCancelled(true); // Mark as explicitly cancelled
      setHasCancelledAndResubmitted(true); // Mark that user has cancelled - prevents reward toast on resubmission
      
      // Force clear cache for this specific submission
      queryClient.removeQueries({
        queryKey: [...submissionKeys.byAssignmentAndClass(classId, assignment.id), "student-safe"],
      });
      
      onSubmissionComplete?.();
    } catch (error) {
      console.error("Cancel submission failed:", error);
    }
  };

  const handleEditSubmission = () => {
    setIsEditMode(true);
    setShowSubmissionHistory(false);
    
    // Load existing submission data into form
    if (submissionData) {
      setSubmissionText(submissionData.content || "");
      const existingFiles: UploadedFileItem[] = submissionData.submittedFiles?.map(doc => ({
        id: doc.id.toString(),
        fileName: doc.fileName,
        publicUrl: doc.publicUrl || "",
        documentId: doc.id,
      })) || [];
      setUploadedFiles(existingFiles);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setSubmissionText(submissionData?.content || "");
    const existingFiles: UploadedFileItem[] = submissionData?.submittedFiles?.map(doc => ({
      id: doc.id.toString(),
      fileName: doc.fileName,
      publicUrl: doc.publicUrl || "",
      documentId: doc.id,
    })) || [];
    setUploadedFiles(existingFiles);
  };

  const buildFormData = (file: File): FormData => {
    const fd = new FormData();
    fd.append("File", file);
    fd.append("ClassId", classId.toString());
    fd.append("ParentType", ParentType.SUBMISSION.toString());
    return fd;
  };

  const submissionFiles = useMemo(
    () =>
      submissionData?.submittedFiles?.map((doc) => ({
        id: doc.id.toString(),
        name: doc.fileName,
        url: doc.publicUrl || "",
        fileType: doc.fileType,
        updatedAt: new Date(doc.updatedAt),
      })) || [],
    [submissionData]
  );

  return {
    // State
    submissionText,
    setSubmissionText,
    uploadedFiles,
    setUploadedFiles,
    isSubmitting,
    submissionData,
    showSubmissionHistory,
    setShowSubmissionHistory,
    isEditMode,

    // Computed
    hasSubmitted,
    isOverdue,
    canSubmit,
    submissionFiles,

    // Handlers
    handleSubmit,
    handleCancelSubmission,
    handleEditSubmission,
    handleCancelEdit,
    buildFormData,
  };

  function maybeShowOnTimeRewardToast(submittedAt?: Date | string | null) {
    if (!submittedAt) {
      return;
    }

    const submittedTime = new Date(submittedAt);
    const deadlineTime = new Date(assignment.deadline);

    if (Number.isNaN(submittedTime.getTime()) || Number.isNaN(deadlineTime.getTime())) {
      return;
    }

    if (submittedTime <= deadlineTime) {
      toast.success(
        t("reward_on_time_submission_toast", {
          points: formatRewardPoints(RewardPointRules.activities.OnTimeSubmission),
        })
      );
    }
  }
}
