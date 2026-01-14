import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { assignmentGroupInvitationApi } from '@/api/assignmentGroupInvitationApi';
import type { AssignmentGroupInvitationResponse } from '@/types/assignmentGroupInvitation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { getApiErrorMessage } from '@/lib/api-error';

// ============ QUERY KEYS ============
export const assignmentGroupInvitationKeys = {
  all: ['assignmentGroupInvitations'] as const,
  received: (classId: number, assignmentId: number) =>
    [...assignmentGroupInvitationKeys.all, 'received', classId, assignmentId] as const,
  sent: (classId: number, assignmentId: number) =>
    [...assignmentGroupInvitationKeys.all, 'sent', classId, assignmentId] as const,
} as const;

// ============ QUERIES (GET) ============

/**
 * Lấy danh sách lời mời nhận được trong bài tập
 */
export function useGetReceivedInvitations(
  classId: number,
  assignmentId: number,
  options?: UseQueryOptions<AssignmentGroupInvitationResponse[], Error>
) {
  return useQuery({
    queryKey: assignmentGroupInvitationKeys.received(classId, assignmentId),
    queryFn: () =>
      assignmentGroupInvitationApi.getReceivedInvitations(classId, assignmentId),
    enabled: !!classId && !!assignmentId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

/**
 * Lấy danh sách lời mời đã gửi trong bài tập
 */
export function useGetSentInvitations(
  classId: number,
  assignmentId: number,
  options?: UseQueryOptions<AssignmentGroupInvitationResponse[], Error>
) {
  return useQuery({
    queryKey: assignmentGroupInvitationKeys.sent(classId, assignmentId),
    queryFn: () =>
      assignmentGroupInvitationApi.getSentInvitations(classId, assignmentId),
    enabled: !!classId && !!assignmentId,
    staleTime: 1 * 60 * 1000,
    ...options,
  });
}

// ============ MUTATIONS (POST) ============

/**
 * Chấp nhận lời mời
 */
export function useAcceptInvitation(
  options?: UseMutationOptions<
    void,
    Error,
    { invitationId: number; classId: number; assignmentId: number }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ invitationId }) =>
      assignmentGroupInvitationApi.accept(invitationId),
    onSuccess: (_, { classId, assignmentId }) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupInvitationKeys.received(classId, assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: assignmentGroupInvitationKeys.sent(classId, assignmentId),
      });
      // Invalidate assignment groups as user has joined a group
      queryClient.invalidateQueries({
        queryKey: ['assignmentGroups'],
      });
      // Invalidate my assignment group to update UI
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup', classId, assignmentId],
      });
      toast.success(t('invitation_accepted_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('invitation_accept_failed'), t)
      );
    },
    ...options,
  });
}

/**
 * Từ chối lời mời
 */
export function useRejectInvitation(
  options?: UseMutationOptions<
    void,
    Error,
    { invitationId: number; classId: number; assignmentId: number }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ invitationId }) =>
      assignmentGroupInvitationApi.reject(invitationId),
    onSuccess: (_, { classId, assignmentId }) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupInvitationKeys.received(classId, assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: assignmentGroupInvitationKeys.sent(classId, assignmentId),
      });
      // Invalidate my assignment group to update UI
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup', classId, assignmentId],
      });
      toast.success(t('invitation_rejected_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('invitation_reject_failed'), t)
      );
    },
    ...options,
  });
}

/**
 * Hủy lời mời đã gửi
 */
export function useCancelInvitation(
  options?: UseMutationOptions<
    void,
    Error,
    { invitationId: number; classId: number; assignmentId: number }
  >
) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: ({ invitationId }) =>
      assignmentGroupInvitationApi.cancel(invitationId),
    onSuccess: (_, { classId, assignmentId }) => {
      queryClient.invalidateQueries({
        queryKey: assignmentGroupInvitationKeys.received(classId, assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: assignmentGroupInvitationKeys.sent(classId, assignmentId),
      });
      // Invalidate all assignment groups to update invitation list in group details
      queryClient.invalidateQueries({
        queryKey: ['assignmentGroups'],
      });
      // Also invalidate my assignment group
      queryClient.invalidateQueries({
        queryKey: ['myAssignmentGroup', classId, assignmentId],
      });
      toast.success(t('invitation_cancelled_successfully'));
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, t('invitation_cancel_failed'), t)
      );
    },
    ...options,
  });
}

// ============ ALIASES FOR CONVENIENCE ============
export const useGetMyAssignmentGroupInvitations = useGetReceivedInvitations;
export const useAcceptAssignmentGroupInvitation = useAcceptInvitation;
export const useRejectAssignmentGroupInvitation = useRejectInvitation;
export const useCancelAssignmentGroupInvitation = useCancelInvitation;