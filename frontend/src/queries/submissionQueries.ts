import {
  useQuery,
  useSuspenseQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
  type UseMutationOptions,
  type QueryClient,
} from "@tanstack/react-query";
import { submissionApi } from "@/api/submissionApi";
import type {
  CreateSubmissionRequest,
  CreateSubmissionResponse,
  SubmissionResponse,
  GradingStatistics,
} from "@/types/submission";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getApiErrorMessage } from "@/lib/api-error";
import { classKeys } from "./classQueries";

// Query Keys
export const submissionKeys = {
  all: ["submissions"] as const,
  byAssignment: (assignmentId: number) =>
    [...submissionKeys.all, "assignment", assignmentId] as const,
  byAssignmentAndClass: (classId: number, assignmentId: number) =>
    [
      ...submissionKeys.all,
      "class",
      classId,
      "assignment",
      assignmentId,
    ] as const,
  details: () => [...submissionKeys.all, "detail"] as const,
  detail: (submissionId: number) =>
    [...submissionKeys.details(), submissionId] as const,
  ungraded: () => [...submissionKeys.all, "ungraded"] as const,
  stats: (assignmentId: number) =>
    [...submissionKeys.all, "stats", assignmentId] as const,
};

// Queries
export function useGetSubmissionsByAssignment(
  assignmentId: number,
  options?: UseQueryOptions<SubmissionResponse[], Error>
) {
  return useQuery({
    queryKey: submissionKeys.byAssignment(assignmentId),
    queryFn: () => submissionApi.getByAssignment(assignmentId),
    enabled: !!assignmentId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useGetSubmissionsByAssignmentAndClass(
  classId: number,
  assignmentId: number,
  options?: UseQueryOptions<SubmissionResponse[], Error>
) {
  return useQuery({
    queryKey: submissionKeys.byAssignmentAndClass(classId, assignmentId),
    queryFn: () => submissionApi.getByAssignmentAndClass(classId, assignmentId),
    enabled: !!classId && !!assignmentId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useGetSubmissionById(
  submissionId: number,
  options?: UseQueryOptions<SubmissionResponse, Error>
) {
  return useQuery({
    queryKey: submissionKeys.detail(submissionId),
    queryFn: () => submissionApi.getById(submissionId),
    enabled: !!submissionId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// Hook mới cho student - lấy submission an toàn theo classId và assignmentId
export function useGetSafeSubmissionForStudent(
  classId: number,
  assignmentId: number,
  options?: UseQueryOptions<CreateSubmissionResponse, Error>
) {
  return useQuery({
    queryKey: [
      ...submissionKeys.byAssignmentAndClass(classId, assignmentId),
      "student-safe",
    ],
    queryFn: () =>
      submissionApi.getSafeSubmissionForStudent(classId, assignmentId),
    enabled: !!classId && !!assignmentId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useGetUngradedSubmissions(
  options?: UseQueryOptions<SubmissionResponse[], Error>
) {
  return useQuery({
    queryKey: submissionKeys.ungraded(),
    queryFn: submissionApi.getUngraded,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useGetGradingStatistics(
  assignmentId: number,
  options?: UseQueryOptions<GradingStatistics, Error>
) {
  return useQuery({
    queryKey: submissionKeys.stats(assignmentId),
    queryFn: () => submissionApi.getGradingStatistics(assignmentId),
    enabled: !!assignmentId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

// Mutations
export function useCreateSubmission(
  options?: UseMutationOptions<
    CreateSubmissionResponse,
    Error,
    { classId: number; assignmentId: number; data: CreateSubmissionRequest }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ classId, assignmentId, data }) =>
      submissionApi.create(classId, assignmentId, data),
    onSuccess: (created, { classId, assignmentId }) => {
      // Invalidate lists related to this assignment
      queryClient.invalidateQueries({
        queryKey: submissionKeys.byAssignment(assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: submissionKeys.byAssignmentAndClass(classId, assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: classKeys.members(classId),
      });
      toast.success(t("submission_created_successfully"));
    },
    onError: (error) => {
      const errorMessage = getApiErrorMessage(
        error,
        t("submission_create_failed"),
        t
      );
      // Check if it's a duplicate submission error
      const isDuplicate = errorMessage.includes("đã nộp") || 
                          errorMessage.includes("already submitted") ||
                          errorMessage.includes("duplicate");
      if (isDuplicate) {
        toast.info(t("already_submitted_assignment"));
      } else {
        toast.error(errorMessage);
      }
    },
    ...options,
  });
}

export function useUpdateSubmission(
  options?: UseMutationOptions<
    SubmissionResponse,
    Error,
    {
      classId: number;
      assignmentId: number;
      data: { id: number; content?: string; documentIds: number[] };
    }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ classId, assignmentId, data }) =>
      submissionApi.update(classId, assignmentId, data),
    onSuccess: (updated, { classId, assignmentId }) => {
      // Update cache
      queryClient.setQueryData(
        [...submissionKeys.byAssignmentAndClass(classId, assignmentId), "student-safe"],
        updated
      );
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: submissionKeys.byAssignment(assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: submissionKeys.byAssignmentAndClass(classId, assignmentId),
      });
      toast.success(t("submission_updated_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("submission_update_failed"), t)
      );
    },
    ...options,
  });
}

export function useCancelSubmission(
  options?: UseMutationOptions<
    { success: boolean; message: string },
    Error,
    { assignmentId: number; submissionId: number; classId: number }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ assignmentId, submissionId }) =>
      submissionApi.cancel(assignmentId, submissionId),
    onSuccess: (_, { classId, assignmentId }) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: [...submissionKeys.byAssignmentAndClass(classId, assignmentId), "student-safe"],
      });
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: submissionKeys.byAssignment(assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: submissionKeys.byAssignmentAndClass(classId, assignmentId),
      });
      toast.success(t("submission_cancelled_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("submission_cancel_failed"), t)
      );
    },
    ...options,
  });
}

// Prefetch utilities for SSR/SSG
export function prefetchSubmissionsByAssignment(
  queryClient: QueryClient,
  assignmentId: number
) {
  return queryClient.prefetchQuery({
    queryKey: submissionKeys.byAssignment(assignmentId),
    queryFn: () => submissionApi.getByAssignment(assignmentId),
    staleTime: 2 * 60 * 1000,
  });
}

export function prefetchSubmissionsByAssignmentAndClass(
  queryClient: QueryClient,
  classId: number,
  assignmentId: number
) {
  return queryClient.prefetchQuery({
    queryKey: submissionKeys.byAssignmentAndClass(classId, assignmentId),
    queryFn: () => submissionApi.getByAssignmentAndClass(classId, assignmentId),
    staleTime: 2 * 60 * 1000,
  });
}

export function prefetchSubmissionDetail(
  queryClient: QueryClient,
  submissionId: number
) {
  return queryClient.prefetchQuery({
    queryKey: submissionKeys.detail(submissionId),
    queryFn: () => submissionApi.getById(submissionId),
    staleTime: 5 * 60 * 1000,
  });
}

export function prefetchGradingStatistics(
  queryClient: QueryClient,
  assignmentId: number
) {
  return queryClient.prefetchQuery({
    queryKey: submissionKeys.stats(assignmentId),
    queryFn: () => submissionApi.getGradingStatistics(assignmentId),
    staleTime: 2 * 60 * 1000,
  });
}

export function prefetchSafeSubmissionForStudent(
  queryClient: QueryClient,
  classId: number,
  assignmentId: number
) {
  return queryClient.prefetchQuery({
    queryKey: [
      ...submissionKeys.byAssignmentAndClass(classId, assignmentId),
      "student-safe",
    ],
    queryFn: () =>
      submissionApi.getSafeSubmissionForStudent(classId, assignmentId),
    staleTime: 5 * 60 * 1000,
  });
}

// SSR-friendly Suspense alternatives
export function useGetSubmissionsByAssignmentAndClassSuspense(
  classId: number,
  assignmentId: number,
  options?: Omit<
    UseSuspenseQueryOptions<SubmissionResponse[], Error>,
    "queryKey" | "queryFn"
  >
) {
  return useSuspenseQuery({
    queryKey: submissionKeys.byAssignmentAndClass(classId, assignmentId),
    queryFn: () => submissionApi.getByAssignmentAndClass(classId, assignmentId),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useGetSubmissionByIdSuspense(
  submissionId: number,
  options?: Omit<
    UseSuspenseQueryOptions<SubmissionResponse, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useSuspenseQuery({
    queryKey: submissionKeys.detail(submissionId),
    queryFn: () => submissionApi.getById(submissionId),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useGetGradingStatisticsSuspense(
  assignmentId: number,
  options?: Omit<
    UseSuspenseQueryOptions<GradingStatistics, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useSuspenseQuery({
    queryKey: submissionKeys.stats(assignmentId),
    queryFn: () => submissionApi.getGradingStatistics(assignmentId),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}
