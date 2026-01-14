import { useMemo, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { submissionKeys } from "@/queries/submissionQueries";
import { SubmissionStatus } from "@/types/submission";
import type { CreateSubmissionResponse } from "@/types/submission";
import type { AssignmentResponse } from "@/types/assignment";
import { AssignmentStatus } from "@/types/constants";

interface UseQuizSubmissionStateProps {
  assignment: AssignmentResponse;
  classId: number;
  isTeacher: boolean;
}

export function useQuizSubmissionState({
  assignment,
  classId,
  isTeacher,
}: UseQuizSubmissionStateProps) {
  const queryClient = useQueryClient();
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showAnswers, setShowAnswers] = useState(!isTeacher);
  const [submissionData, setSubmissionData] =
    useState<CreateSubmissionResponse | null>(null);

  // Get submission data from prefetched SSR cache
  const existingSubmissionData = useMemo(() => {
    if (isTeacher) return null;
    return queryClient.getQueryData<CreateSubmissionResponse>([
      ...submissionKeys.byAssignmentAndClass(classId, assignment.id),
      "student-safe",
    ]);
  }, [queryClient, classId, assignment.id, isTeacher]);

  // Update submission status and data when existing submission is found
  useEffect(() => {
    if (existingSubmissionData && !isTeacher) {
      setSubmissionStatus(existingSubmissionData.status);
      setSubmissionData(existingSubmissionData);
    }
  }, [existingSubmissionData, isTeacher]);

  // Check hasSubmitted from both local state and existingSubmissionData
  const hasSubmitted = useMemo(() => {
    const localSubmitted =
      submissionStatus === SubmissionStatus.Submitted ||
      submissionStatus === SubmissionStatus.Graded;
    const existingSubmitted =
      existingSubmissionData?.status === SubmissionStatus.Submitted ||
      existingSubmissionData?.status === SubmissionStatus.Graded;
    return localSubmitted || existingSubmitted;
  }, [submissionStatus, existingSubmissionData?.status]);

  // Check if assignment is overdue
  const isOverdue =
    assignment.status === AssignmentStatus.Expired ||
    new Date(assignment.deadline) < new Date();
  const canSubmit =
    !isOverdue &&
    !hasSubmitted &&
    assignment.status === AssignmentStatus.Assigned;

  const questions = useMemo(
    () => assignment.listQuestions || [],
    [assignment.listQuestions]
  );

  const activeSubmission = submissionData || existingSubmissionData;
  const hasAnswers =
    (submissionData?.answers?.length || 0) > 0 ||
    (existingSubmissionData?.answers?.length || 0) > 0;

  const totalSelectedOptions =
    activeSubmission?.answers?.reduce(
      (total, answer) => total + (answer.selectedOptionIds?.length || 0),
      0
    ) || 0;

  const shouldShowHistory =
    hasSubmitted &&
    showAnswers &&
    (submissionData?.answers || existingSubmissionData?.answers);

  const getSubmittedAnswerForQuestion = (questionId: number): number[] => {
    // Find answer by questionId instead of index to handle out-of-order submissions
    const answer =
      submissionData?.answers?.find((a) => a.quizQuestionId === questionId) ||
      existingSubmissionData?.answers?.find(
        (a) => a.quizQuestionId === questionId
      );

    return answer?.selectedOptionIds || [];
  };

  return {
    submissionStatus,
    setSubmissionStatus,
    showResults,
    setShowResults,
    showAnswers,
    setShowAnswers,
    submissionData,
    setSubmissionData,
    existingSubmissionData,
    hasSubmitted,
    isOverdue,
    canSubmit,
    questions,
    activeSubmission,
    hasAnswers,
    totalSelectedOptions,
    shouldShowHistory,
    getSubmittedAnswerForQuestion,
  };
}
