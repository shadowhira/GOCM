import { gradeApi } from "@/api/gradeApi";
import { CreateGradeRequest } from "@/types/grade";
import { SubmissionResponse } from "@/types/submission";
import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query";
import { submissionKeys } from "./submissionQueries";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useQuery,
  type UseQueryOptions,
  type QueryClient,
} from "@tanstack/react-query";
import type {
  StudentAverageGrade,
  ClassGradeOverview,
  AssignmentGradeDetail,
  PaginatedAssignmentGradeSummary,
  StudentGradesSummary,
} from "@/types/grade";
import { classKeys } from "./classQueries";
import {
  RewardPointRules,
  formatRewardPoints,
} from "@/config/rewardPointRules";

// Query Keys
export const gradeKeys = {
  all: ["grades"] as const,
  class: (classId: number) => [...gradeKeys.all, "class", classId] as const,
  classOverview: (classId: number) =>
    [...gradeKeys.class(classId), "overview"] as const,
  studentAverages: (classId: number) =>
    [...gradeKeys.class(classId), "student-averages"] as const,
  assignmentSummaries: (
    classId: number,
    pageNumber?: number,
    pageSize?: number,
    searchTerm?: string
  ) =>
    [
      ...gradeKeys.class(classId),
      "assignment-summaries",
      { pageNumber, pageSize, searchTerm },
    ] as const,
  assignmentDetails: (classId: number, assignmentId: number) =>
    [
      ...gradeKeys.class(classId),
      "assignment",
      assignmentId,
      "details",
    ] as const,
  studentGrades: (classId: number, studentId: number) =>
    [...gradeKeys.class(classId), "student", studentId, "grades"] as const,
  myGrades: (classId: number) =>
    [...gradeKeys.class(classId), "my-grades"] as const,
  assignmentGrades: (assignmentId: number) =>
    [...gradeKeys.all, "assignment", assignmentId, "grades"] as const,
  classAssignmentGrades: (classId: number, assignmentId: number) =>
    [
      ...gradeKeys.class(classId),
      "assignment",
      assignmentId,
      "grades",
    ] as const,
};

// Queries
export function useGetClassGradeOverview(
  classId: number,
  options?: UseQueryOptions<ClassGradeOverview, Error>
) {
  return useQuery({
    queryKey: gradeKeys.classOverview(classId),
    queryFn: () => gradeApi.getClassGradeOverview(classId),
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 15 * 60 * 1000, // 15 minutes - cache time
    ...options,
  });
}

export function useGetStudentAverageGrades(
  classId: number,
  options?: UseQueryOptions<StudentAverageGrade[], Error>
) {
  return useQuery({
    queryKey: gradeKeys.studentAverages(classId),
    queryFn: () => gradeApi.getStudentAverageGrades(classId),
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 15 * 60 * 1000, // 15 minutes - cache time
    ...options,
  });
}

export function useGetAssignmentGradeSummaries(
  classId: number,
  pageNumber: number = 1,
  pageSize: number = 10,
  searchTerm: string = "",
  options?: UseQueryOptions<PaginatedAssignmentGradeSummary, Error>
) {
  return useQuery({
    queryKey: gradeKeys.assignmentSummaries(
      classId,
      pageNumber,
      pageSize,
      searchTerm
    ),
    queryFn: () => {
      console.log(
        `🔥 Fetching assignment grades: classId=${classId}, page=${pageNumber}, size=${pageSize}, searchTerm="${searchTerm}"`
      );
      return gradeApi.getAssignmentGradeSummaries(
        classId,
        pageNumber,
        pageSize,
        searchTerm
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 15 * 60 * 1000, // 15 minutes - cache time
    ...options,
  });
}

export function useGetAssignmentGradeDetails(
  classId: number,
  assignmentId: number,
  options?: UseQueryOptions<AssignmentGradeDetail, Error>
) {
  return useQuery({
    queryKey: gradeKeys.assignmentDetails(classId, assignmentId),
    queryFn: () => gradeApi.getAssignmentGradeDetails(classId, assignmentId),
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 15 * 60 * 1000, // 15 minutes - cache time
    ...options,
  });
}

// Prefetch utilities for SSR/SSG
export function prefetchClassGradeOverview(
  queryClient: QueryClient,
  classId: number
) {
  return queryClient.prefetchQuery({
    queryKey: gradeKeys.classOverview(classId),
    queryFn: () => gradeApi.getClassGradeOverview(classId),
  });
}

export function prefetchStudentAverageGrades(
  queryClient: QueryClient,
  classId: number
) {
  return queryClient.prefetchQuery({
    queryKey: gradeKeys.studentAverages(classId),
    queryFn: () => gradeApi.getStudentAverageGrades(classId),
  });
}

export function prefetchAssignmentGradeSummaries(
  queryClient: QueryClient,
  classId: number,
  pageNumber: number = 1,
  pageSize: number = 10,
  searchTerm: string = ""
) {
  return queryClient.prefetchQuery({
    queryKey: gradeKeys.assignmentSummaries(
      classId,
      pageNumber,
      pageSize,
      searchTerm
    ),
    queryFn: () =>
      gradeApi.getAssignmentGradeSummaries(
        classId,
        pageNumber,
        pageSize,
        searchTerm
      ),
  });
}

export function prefetchAssignmentGradeDetails(
  queryClient: QueryClient,
  classId: number,
  assignmentId: number
) {
  return queryClient.prefetchQuery({
    queryKey: gradeKeys.assignmentDetails(classId, assignmentId),
    queryFn: () => gradeApi.getAssignmentGradeDetails(classId, assignmentId),
  });
}

// Student View Queries
export function useGetMyGrades(
  classId: number,
  options?: UseQueryOptions<StudentGradesSummary, Error>
) {
  return useQuery({
    queryKey: gradeKeys.myGrades(classId),
    queryFn: () => gradeApi.getMyGrades(classId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

export function prefetchMyGrades(queryClient: QueryClient, classId: number) {
  return queryClient.prefetchQuery({
    queryKey: gradeKeys.myGrades(classId),
    queryFn: () => gradeApi.getMyGrades(classId),
  });
}
export function useGradeSubmission(
  options?: UseMutationOptions<
    SubmissionResponse,
    Error,
    {
      submissionId: number;
      data: CreateGradeRequest;
      assignmentId?: number;
      classId?: number;
      assignmentMaxScore?: number;
    }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ submissionId, data }) =>
      gradeApi.grade(submissionId, data),
    onSuccess: (updated, { submissionId, assignmentId, classId, assignmentMaxScore }) => {
      // Update detail cache
      queryClient.setQueryData(submissionKeys.detail(submissionId), updated);
      // Invalidate lists and stats if assignmentId is provided
      if (assignmentId) {
        queryClient.invalidateQueries({
          queryKey: submissionKeys.byAssignment(assignmentId),
        });
        queryClient.invalidateQueries({
          queryKey: submissionKeys.stats(assignmentId),
        });
      }
      if (assignmentId && classId) {
        queryClient.invalidateQueries({
          queryKey: submissionKeys.byAssignmentAndClass(classId, assignmentId),
        });
      }
      // Ungraded list likely changes as well
      queryClient.invalidateQueries({ queryKey: submissionKeys.ungraded() });
      // Invalidate grade-related queries
      if (classId) {
        queryClient.invalidateQueries({
          queryKey: gradeKeys.class(classId),
        });
        queryClient.invalidateQueries({
          queryKey: classKeys.members(classId),
        });
      }

      maybeShowHighGradeRewardToast(updated, assignmentMaxScore);
      toast.success(t("submission_graded_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("submission_grade_failed"), t)
      );
    },
    ...options,
  });

  function maybeShowHighGradeRewardToast(
    submission: SubmissionResponse,
    assignmentMaxScore?: number
  ) {
    const score = submission.grade?.score;
    if (typeof score !== "number") {
      return;
    }

    const normalizedScore = assignmentMaxScore && assignmentMaxScore > 0
      ? (score / assignmentMaxScore) * 100
      : score;

    if (normalizedScore >= RewardPointRules.thresholds.HighGradeScore) {
      toast.success(
        t("reward_high_grade_toast", {
          points: formatRewardPoints(RewardPointRules.activities.HighGradeBonus),
          score: normalizedScore.toFixed(1),
        })
      );
    }
  }
}
