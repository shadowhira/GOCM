import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { assignmentGroupTopicApi } from '@/api/assignmentGroupTopicApi';
import type {
  CreateAssignmentGroupTopicRequest,
  UpdateAssignmentGroupTopicRequest,
  AssignmentGroupTopicResponse,
} from '@/types/assignmentGroupTopic';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { getApiErrorMessage } from '@/lib/api-error';
import { AssignmentGroupResponse } from '@/types/assignmentGroup';
import { assignmentGroupApi } from '@/api/assignmentGroupApi';

// ============ QUERY KEYS ============
export const assignmentGroupTopicKeys = {
  all: ['assignmentGroupTopics'] as const,
  byAssignment: (classId: number, assignmentId: number) =>
    [...assignmentGroupTopicKeys.all, 'assignment', classId, assignmentId] as const,
  details: () => [...assignmentGroupTopicKeys.all, 'detail'] as const,
  detail: (topicId: number) =>
    [...assignmentGroupTopicKeys.details(), topicId] as const,
  byGroup: (groupId: number) =>
    [...assignmentGroupTopicKeys.all, 'group', groupId] as const,
} as const;

// ============ QUERIES (GET) ============

/**
 * Lấy tất cả chủ đề nhóm của bài tập
 */
export function useGetAllAssignmentGroupTopics(
  classId: number,
  assignmentId: number,
  options?: UseQueryOptions<AssignmentGroupTopicResponse[], Error>
) {
  return useQuery({
    queryKey: assignmentGroupTopicKeys.byAssignment(classId, assignmentId),
    queryFn: () =>
      assignmentGroupTopicApi.getAllByAssignment(classId, assignmentId),
    enabled: !!classId && !!assignmentId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Lấy thông tin chi tiết chủ đề nhóm
 */
export function useGetAssignmentGroupTopicById(
  topicId: number,
  options?: Omit<UseQueryOptions<AssignmentGroupTopicResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: assignmentGroupTopicKeys.detail(topicId),
    queryFn: () => assignmentGroupTopicApi.getById(topicId),
    enabled: !!topicId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useGetAssignmentGroupTopicByGroupId(
  groupId: number,
  options?: Omit<UseQueryOptions<AssignmentGroupTopicResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: assignmentGroupTopicKeys.byGroup(groupId),
    queryFn: () => assignmentGroupTopicApi.getByGroupId(groupId),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

// ============ MUTATIONS (POST/PUT/DELETE) ============

/**
 * Tạo chủ đề nhóm cho bài tập
 */
export function useCreateAssignmentGroupTopic(
  options?: UseMutationOptions<
    AssignmentGroupTopicResponse,
    Error,
    {
      classId: number;
      assignmentId: number;
      data: CreateAssignmentGroupTopicRequest;
    }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ classId, assignmentId, data }) =>
      assignmentGroupTopicApi.create(classId, assignmentId, data),
    onSuccess: (_, { classId, assignmentId }) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupTopicKeys.byAssignment(classId, assignmentId),
      });
      toast.success(t('group_topic_created_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('group_topic_create_failed'), t)
      );
    },
    ...options,
  });
}

/**
 * Cập nhật chủ đề nhóm
 */
export function useUpdateAssignmentGroupTopic(
  options?: UseMutationOptions<
    AssignmentGroupTopicResponse,
    Error,
    { topicId: number; data: UpdateAssignmentGroupTopicRequest }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ topicId, data }) =>
      assignmentGroupTopicApi.update(topicId, data),
    onSuccess: (updated, { topicId }) => {
      queryClient.setQueryData(
        assignmentGroupTopicKeys.detail(topicId),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: assignmentGroupTopicKeys.all,
      });
      toast.success(t('group_topic_updated_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('group_topic_update_failed'), t)
      );
    },
    ...options,
  });
}

/**
 * Xóa chủ đề nhóm
 */
export function useDeleteAssignmentGroupTopic(
  options?: UseMutationOptions<
    void,
    Error,
    { topicId: number; classId: number; assignmentId: number }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ topicId }) => assignmentGroupTopicApi.remove(topicId),
    onSuccess: (_, { classId, assignmentId, topicId }) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupTopicKeys.byAssignment(classId, assignmentId),
      });
      queryClient.removeQueries({
        queryKey: assignmentGroupTopicKeys.detail(topicId),
      });
      toast.success(t('group_topic_deleted_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('group_topic_delete_failed'), t)
      );
    },
    ...options,
  });
}

/**
 * Lấy thông tin nhóm của sinh viên hiện tại trong bài tập
 * (Exported từ assignmentGroupTopicQueries để dùng chung với các hook khác)
 */
export function useGetMyAssignmentGroup(
  classId: number,
  assignmentId: number,
  options?: UseQueryOptions<AssignmentGroupResponse | null, Error>
) {
  return useQuery({
    queryKey: ['myAssignmentGroup', classId, assignmentId],
    queryFn: () => assignmentGroupApi.getMyGroup(classId, assignmentId),
    enabled: !!classId && !!assignmentId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}