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
import { assignmentApi } from "@/api/assignmentApi";
import type {
  AssignmentResponse,
  AssignmentDetailResponse,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  CreateAssignmentFromExcelRequest,
  GetPaginatedAssignmentsRequest,
  PaginatedAssignmentResponse,
  AllowShowResultToStudentRequest,
  AssignmentUnsubmittedCountResponse,
} from "@/types/assignment";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getApiErrorMessage } from "@/lib/api-error";

// Query Keys
export const assignmentKeys = {
  all: ["assignments"] as const,
  lists: () => [...assignmentKeys.all, "list"] as const,
  list: (params: GetPaginatedAssignmentsRequest) =>
    [...assignmentKeys.lists(), params.pageNumber, params.pageSize, params.type ?? "all", params.excludeType ?? "none"] as const,
  details: () => [...assignmentKeys.all, "detail"] as const,
  detail: (id: number) => [...assignmentKeys.details(), id] as const,
  byClass: (classId: number) =>
    [...assignmentKeys.all, "class", classId] as const,
  byClassPaginated: (classId: number, params: GetPaginatedAssignmentsRequest) =>
    [
      ...assignmentKeys.byClass(classId),
      "paginated",
      params.pageNumber,
      params.pageSize,
      params.type ?? "all",
      params.excludeType ?? "none",
    ] as const,
  unsubmittedCount: (classId: number) =>
    [...assignmentKeys.byClass(classId), "unsubmitted-count"] as const,
};

// Queries
export function useGetAllAssignments(
  options?: UseQueryOptions<AssignmentResponse[], Error>
) {
  return useQuery({
    queryKey: assignmentKeys.all,
    queryFn: assignmentApi.getAll,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useGetAssignments(
  params: GetPaginatedAssignmentsRequest,
  options?: UseQueryOptions<PaginatedAssignmentResponse, Error>
) {
  return useQuery({
    queryKey: assignmentKeys.list(params),
    queryFn: () => assignmentApi.getList(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

export function useGetAssignmentById(
  id: number,
  options?: UseQueryOptions<AssignmentResponse, Error>
) {
  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => assignmentApi.getById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

export function useGetAssignmentsByClassId(
  classId: number,
  options?: UseQueryOptions<AssignmentResponse[], Error>
) {
  return useQuery({
    queryKey: assignmentKeys.byClass(classId),
    queryFn: () => assignmentApi.getAllByClassId(classId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!classId,
    ...options,
  });
}

export function useGetAssignmentsByClassIdPaginated(
  classId: number,
  params: GetPaginatedAssignmentsRequest,
  options?: UseQueryOptions<PaginatedAssignmentResponse, Error>
) {
  return useQuery({
    queryKey: assignmentKeys.byClassPaginated(classId, params),
    queryFn: () => assignmentApi.getListByClassId(classId, params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!classId,
    ...options,
  });
}

// Get full assignment with answers for teacher only
export function useGetAssignmentFullForTeacher(
  classId: number,
  assignmentId: number,
  options?: Omit<UseQueryOptions<AssignmentDetailResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: [
      ...assignmentKeys.detail(assignmentId),
      "full",
      classId,
    ] as const,
    queryFn: () => assignmentApi.getFullForTeacher(classId, assignmentId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!classId && !!assignmentId,
    ...options,
  });
}

// Get count of unsubmitted assignments by user in class
export function useGetUnsubmittedCountByUserInClass(
  classId: number,
  options?: UseQueryOptions<AssignmentUnsubmittedCountResponse, Error>
) {
  return useQuery({
    queryKey: assignmentKeys.unsubmittedCount(classId),
    queryFn: () => assignmentApi.getCountUnsubmittedByUserInClass(classId),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!classId,
    ...options,
  });
}

// Mutations
export function useCreateAssignment(
  options?: UseMutationOptions<
    AssignmentDetailResponse,
    Error,
    { classId: number; data: CreateAssignmentRequest }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ classId, data }) => assignmentApi.create(classId, data),
    onSuccess: (newAssignment, { classId }) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byClass(classId),
      });
      // Invalidate paginated queries for this class
      queryClient.invalidateQueries({
        queryKey: [...assignmentKeys.byClass(classId), "paginated"],
      });

      toast.success(t("assignment_created_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("assignment_create_failed"), t)
      );
    },
    ...options,
  });
}

export function useUpdateAssignment(
  options?: UseMutationOptions<
    AssignmentDetailResponse,
    Error,
    { classId: number; assignmentId: number; data: UpdateAssignmentRequest }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ classId, assignmentId, data }) =>
      assignmentApi.update(classId, assignmentId, data),
    onSuccess: (updatedAssignment, { assignmentId }) => {
      // Update the specific assignment in cache
      queryClient.setQueryData(
        assignmentKeys.detail(assignmentId),
        updatedAssignment
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      // Invalidate all paginated queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "assignments" &&
          query.queryKey.includes("paginated"),
      });

      toast.success(t("assignment_updated_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("assignment_update_failed"), t)
      );
    },
    ...options,
  });
}

export function useAllowShowResultToStudent(
  options?: UseMutationOptions<void, Error, { assignmentId: number; data: AllowShowResultToStudentRequest }>
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ assignmentId, data }) => assignmentApi.allowShowResultToStudent(assignmentId, data),
    onSuccess: (_, { assignmentId, data }) => {
      // Update cache directly for immediate UI update
      queryClient.setQueryData<AssignmentResponse>(
        assignmentKeys.detail(assignmentId),
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            allowShowResultToStudent: data.allowShowResultToStudent,
          };
        }
      );
      
      // Also invalidate to ensure all related queries are refreshed
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(assignmentId) });
      // Invalidate class assignments list to update any list views
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });

      toast.success(t("allow_show_result_updated_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("allow_show_result_update_failed"), t)
      );
    },
    ...options,
  });
}

export function useDeleteAssignment(
  options?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: assignmentApi.remove,
    onSuccess: (_, assignmentId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: assignmentKeys.detail(assignmentId),
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      // Invalidate all paginated queries
      queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "assignments" &&
          query.queryKey.includes("paginated"),
      });

      toast.success(t("assignment_deleted_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("assignment_delete_failed"), t)
      );
    },
    ...options,
  });
}

export function useCreateAssignmentFromExcel(
  options?: UseMutationOptions<
    AssignmentDetailResponse,
    Error,
    { classId: number; excelFile: File; data: CreateAssignmentFromExcelRequest }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ classId, excelFile, data }) =>
      assignmentApi.createFromExcel(classId, excelFile, data),
    onSuccess: (newAssignment, { classId }) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.byClass(classId),
      });
      // Invalidate paginated queries for this class
      queryClient.invalidateQueries({
        queryKey: [...assignmentKeys.byClass(classId), "paginated"],
      });

      toast.success(t("assignment_created_from_excel_successfully"));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t("assignment_create_from_excel_failed"), t)
      );
    },
    ...options,
  });
}

// Prefetch utilities for SSR/SSG
export function prefetchAssignments(
  queryClient: QueryClient,
  params: GetPaginatedAssignmentsRequest
) {
  return queryClient.prefetchQuery({
    queryKey: assignmentKeys.list(params),
    queryFn: () => assignmentApi.getList(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function prefetchAssignmentsByClassId(
  queryClient: QueryClient,
  classId: number
) {
  return queryClient.prefetchQuery({
    queryKey: assignmentKeys.byClass(classId),
    queryFn: () => assignmentApi.getAllByClassId(classId),
    staleTime: 2 * 60 * 1000,
  });
}

export function prefetchAssignmentsByClassIdPaginated(
  queryClient: QueryClient,
  classId: number,
  params: GetPaginatedAssignmentsRequest
) {
  return queryClient.prefetchQuery({
    queryKey: assignmentKeys.byClassPaginated(classId, params),
    queryFn: () => assignmentApi.getListByClassId(classId, params),
    staleTime: 2 * 60 * 1000,
  });
}

export function prefetchAssignmentDetail(queryClient: QueryClient, id: number) {
  return queryClient.prefetchQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => assignmentApi.getById(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function prefetchUnsubmittedCountByUserInClass(
  queryClient: QueryClient,
  classId: number
) {
  return queryClient.prefetchQuery({
    queryKey: assignmentKeys.unsubmittedCount(classId),
    queryFn: () => assignmentApi.getCountUnsubmittedByUserInClass(classId),
    staleTime: 1 * 60 * 1000,
  });
}

// SSR-friendly Suspense alternatives
export function useGetAssignmentByIdSuspense(
  id: number,
  options?: Omit<
    UseSuspenseQueryOptions<AssignmentResponse>,
    "queryKey" | "queryFn"
  >
) {
  return useSuspenseQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => assignmentApi.getById(id),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useGetAssignmentsByClassIdSuspense(
  classId: number,
  params: GetPaginatedAssignmentsRequest,
  options?: Omit<
    UseSuspenseQueryOptions<PaginatedAssignmentResponse>,
    "queryKey" | "queryFn"
  >
) {
  return useSuspenseQuery({
    queryKey: assignmentKeys.byClassPaginated(classId, params),
    queryFn: () => assignmentApi.getListByClassId(classId, params),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}
