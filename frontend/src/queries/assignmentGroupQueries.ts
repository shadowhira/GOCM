import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { assignmentGroupApi } from '@/api/assignmentGroupApi';
import type {
  CreateAssignmentGroupRequest,
  UpdateAssignmentGroupRequest,
  RejectAssignmentGroupRequest,
  AssignmentGroupResponse,
  AssignmentGroupApprovalRequestResponse,
} from '@/types/assignmentGroup';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { getApiErrorMessage } from '@/lib/api-error';

// ============ QUERY KEYS ============
export const assignmentGroupKeys = {
  all: ['assignmentGroups'] as const,
  byAssignment: (classId: number, assignmentId: number) =>
    [...assignmentGroupKeys.all, 'assignment', classId, assignmentId] as const,
  approvalRequests: (classId: number, assignmentId: number) =>
    [...assignmentGroupKeys.all, 'approvalRequests', classId, assignmentId] as const,
  details: () => [...assignmentGroupKeys.all, 'detail'] as const,
  detail: (assignmentGroupId: number) =>
    [...assignmentGroupKeys.details(), assignmentGroupId] as const,
} as const;

// ============ QUERIES (GET) ============

/**
 * Lấy tất cả nhóm của bài tập
 */
export function useGetAllAssignmentGroupsByAssignment(
  classId: number,
  assignmentId: number,
  options?: UseQueryOptions<AssignmentGroupResponse[], Error>
) {
  return useQuery({
    queryKey: assignmentGroupKeys.byAssignment(classId, assignmentId),
    queryFn: () => assignmentGroupApi.getAllByAssignment(classId, assignmentId),
    enabled: !!classId && !!assignmentId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Lấy tất cả approval requests của bài tập (cho teacher)
 */
export function useGetApprovalRequests(
  classId: number,
  assignmentId: number,
  options?: UseQueryOptions<AssignmentGroupApprovalRequestResponse[], Error>
) {
  return useQuery({
    queryKey: assignmentGroupKeys.approvalRequests(classId, assignmentId),
    queryFn: () => assignmentGroupApi.getApprovalRequests(classId, assignmentId),
    enabled: !!classId && !!assignmentId,
    staleTime: 1 * 60 * 1000, // 1 minute - shorter since approval status changes frequently
    ...options,
  });
}

/**
 * Lấy thông tin chi tiết nhóm
 */
export function useGetAssignmentGroupById(
  assignmentGroupId: number,
  options?: Omit<UseQueryOptions<AssignmentGroupResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: assignmentGroupKeys.detail(assignmentGroupId),
    queryFn: () => assignmentGroupApi.getById(assignmentGroupId),
    enabled: !!assignmentGroupId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

// ============ MUTATIONS (POST/PUT/DELETE) ============

/**
 * Tạo nhóm bài tập
 */
export function useCreateAssignmentGroup(
  options?: UseMutationOptions<
    AssignmentGroupResponse,
    Error,
    { classId: number; assignmentId: number; data: CreateAssignmentGroupRequest }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ classId, assignmentId, data }) =>
      assignmentGroupApi.create(classId, assignmentId, data),
    onSuccess: (_, { classId, assignmentId }) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.byAssignment(classId, assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup', classId, assignmentId],
      });
      toast.success(t('assignment_group_created_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('assignment_group_create_failed'), t)
      );
    },
    ...options,
  });
}

/**
 * Cập nhật thông tin nhóm
 */
export function useUpdateAssignmentGroup(
  options?: UseMutationOptions<
    AssignmentGroupResponse,
    Error,
    { assignmentGroupId: number; data: UpdateAssignmentGroupRequest }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ assignmentGroupId, data }) =>
      assignmentGroupApi.update(assignmentGroupId, data),
    onSuccess: (updated, { assignmentGroupId }) => {
      queryClient.setQueryData(
        assignmentGroupKeys.detail(assignmentGroupId),
        updated
      );
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.all,
      });
      toast.success(t('assignment_group_updated_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('assignment_group_update_failed'), t)
      );
    },
    ...options,
  });
}

/**
 * Tham gia nhóm
 */
export function useJoinAssignmentGroup(
  options?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (assignmentGroupId: number) =>
      assignmentGroupApi.join(assignmentGroupId),
    onSuccess: (_, assignmentGroupId) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.detail(assignmentGroupId),
      });
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup'],
      });
      toast.success(t('assignment_group_joined_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('assignment_group_join_failed'), t)
      );
    },
    ...options,
  });
}

/**
 * Rời khỏi nhóm
 */
export function useLeaveAssignmentGroup(
  options?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (assignmentGroupId: number) =>
      assignmentGroupApi.leave(assignmentGroupId),
    onSuccess: (_, assignmentGroupId) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.detail(assignmentGroupId),
      });
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup'],
      });
      toast.success(t('assignment_group_left_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('assignment_group_leave_failed'), t)
      );
    },
    ...options,
  });
}

/**
 * Mời thành viên vào nhóm
 */
export function useInviteMemberToAssignmentGroup(
  options?: UseMutationOptions<
    void,
    Error,
    { assignmentGroupId: number; memberId: number }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ assignmentGroupId, memberId }) =>
      assignmentGroupApi.inviteMember(assignmentGroupId, memberId),
    onSuccess: (_, { assignmentGroupId }) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.detail(assignmentGroupId),
      });
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup'],
      });
      toast.success(t('member_invited_successfully'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('member_invite_failed'), t));
    },
    ...options,
  });
}

/**
 * Xóa thành viên khỏi nhóm
 */
export function useRemoveMemberFromAssignmentGroup(
  options?: UseMutationOptions<
    void,
    Error,
    { assignmentGroupId: number; memberId: number }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ assignmentGroupId, memberId }) =>
      assignmentGroupApi.removeMember(assignmentGroupId, memberId),
    onSuccess: (_, { assignmentGroupId }) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.detail(assignmentGroupId),
      });
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup'],
      });
      toast.success(t('member_removed_successfully'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('member_remove_failed'), t));
    },
    ...options,
  });
}

/**
 * Chuyển quyền lãnh đạo nhóm
 */
export function useTransferLeadership(
  options?: UseMutationOptions<
    void,
    Error,
    { assignmentGroupId: number; memberId: number }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();
  return useMutation({
    mutationFn: ({ assignmentGroupId, memberId }) =>
      assignmentGroupApi.transferLeadership(assignmentGroupId, memberId),
    onSuccess: (_, { assignmentGroupId }) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.detail(assignmentGroupId),
      });
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup'],
      });
      toast.success(t('leadership_transferred_successfully'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('leadership_transfer_failed'), t));
    },
    ...options,
  });
}

/**
 * Yêu cầu duyệt nhóm
 */
export function useRequestAssignmentGroupApproval(
  options?: UseMutationOptions<
    void,
    Error,
    { assignmentGroupId: number; topicId: number }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ assignmentGroupId, topicId }) =>
      assignmentGroupApi.requestApproval(assignmentGroupId, topicId),
    onSuccess: (_, { assignmentGroupId }) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.detail(assignmentGroupId),
      });
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup'],
      });
      toast.success(t('approval_request_sent_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('approval_request_send_failed'), t)
      );

    },
    ...options,
  });
}

/**
 * Chấp nhận yêu cầu tạo nhóm
 */
export function useAcceptAssignmentGroupRequest(
  options?: UseMutationOptions<void, Error, number>
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (approvalRequestId: number) =>
      assignmentGroupApi.acceptRequest(approvalRequestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup'],
      });
      toast.success(t('group_approved_successfully'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('group_approval_failed'), t));
    },
    ...options,
  });
}

/**
 * Từ chối yêu cầu tạo nhóm
 */
export function useRejectAssignmentGroupRequest(
  options?: UseMutationOptions<
    void,
    Error,
    { approvalRequestId: number; data: RejectAssignmentGroupRequest }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ approvalRequestId, data }) =>
      assignmentGroupApi.rejectRequest(approvalRequestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup'],
      });
      toast.success(t('group_rejected_successfully'));
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t('group_rejection_failed'), t));
    },
    ...options,
  });
}