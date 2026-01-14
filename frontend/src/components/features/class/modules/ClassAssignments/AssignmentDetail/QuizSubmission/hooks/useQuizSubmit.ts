import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCreateSubmission } from "@/queries/submissionQueries";
import { buildCreateSubmissionSchema } from "@/schemas/submissionSchema";
import { AssignmentType } from "@/types/constants";
import { SubmissionStatus } from "@/types/submission";
import type {
  CreateSubmissionRequest,
  CreateSubmissionResponse,
} from "@/types/submission";
import type { AxiosError } from "axios";
import {
  RewardPointRules,
  formatRewardPoints,
} from "@/config/rewardPointRules";

interface QuizAnswer {
  questionId: number;
  selectedOptions: number[];
}

interface UseQuizSubmitProps {
  classId: number;
  assignmentId: number;
  assignmentDeadline: Date | string;
  isTeacher: boolean;
  onSubmissionComplete?: () => void;
  setSubmissionStatus: (status: SubmissionStatus | null) => void;
  setSubmissionData: (data: CreateSubmissionResponse | null) => void;
  setShowResults: (show: boolean) => void;
}

export function useQuizSubmit({
  classId,
  assignmentId,
  assignmentDeadline,
  isTeacher,
  onSubmissionComplete,
  setSubmissionStatus,
  setSubmissionData,
  setShowResults,
}: UseQuizSubmitProps) {
  const t = useTranslations();
  const createSubmission = useCreateSubmission();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maybeShowOnTimeRewardToast = useCallback(
    (submittedAt?: Date | string | null) => {
      if (!submittedAt) {
        return;
      }

      const submittedTime = new Date(submittedAt);
      const deadlineTime = new Date(assignmentDeadline);

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
    },
    [assignmentDeadline, t]
  );

  const handleSubmit = useCallback(
    async (answers: QuizAnswer[]) => {
      setIsSubmitting(true);

      try {
        const answersPayload = answers.map((a) => ({
          quizQuestionId: a.questionId,
          selectedOptionIds: a.selectedOptions,
          isCorrect: false,
          timeSpent: 0,
          answeredAt: new Date(),
        }));

        const payload: CreateSubmissionRequest = {
          content: undefined,
          documentIds: [],
          answers: answersPayload,
        };

        buildCreateSubmissionSchema(AssignmentType.Quiz).parse(payload);

        const created = await createSubmission.mutateAsync({
          classId: classId,
          assignmentId: assignmentId,
          data: payload,
        });

        setSubmissionStatus(created.status);
        setSubmissionData(created);
        maybeShowOnTimeRewardToast(created.submittedTime);
        setShowResults(isTeacher && created.status === SubmissionStatus.Graded);
        onSubmissionComplete?.();
      } catch (error) {
        const axiosErr = error as AxiosError<unknown>;
        const payload = axiosErr?.response?.data as
          | Record<string, unknown>
          | undefined;
        const code =
          typeof payload?.code === "number"
            ? (payload!.code as number)
            : undefined;
        const errors = Array.isArray(payload?.errors)
          ? (payload!.errors as string[])
          : undefined;
        if (code === 3 || errors?.some((e) => e.includes("đã nộp bài"))) {
          setSubmissionStatus(SubmissionStatus.Submitted);
          setShowResults(false);
          toast.info(t("already_submitted_assignment"));
        } else {
          console.error("Quiz submission failed:", error);
          toast.error(t("quiz_submission_failed"));
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      classId,
      assignmentId,
      isTeacher,
      createSubmission,
      setSubmissionStatus,
      setSubmissionData,
      setShowResults,
      onSubmissionComplete,
      t,
      maybeShowOnTimeRewardToast,
    ]
  );

  return {
    handleSubmit,
    isSubmitting,
  };
}
