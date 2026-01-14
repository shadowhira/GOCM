import httpClient from '@/lib/axios';
import type { AssignmentGroupInvitationResponse } from '@/types/assignmentGroupInvitation';

export const assignmentGroupInvitationApi = {
  // GET /api/AssignmentGroupInvitation/classes/{classId}/assignments/{assignmentId}/invitations-received
  // Lấy danh sách lời mời nhận được trong bài tập
  getReceivedInvitations: (
    classId: number,
    assignmentId: number
  ): Promise<AssignmentGroupInvitationResponse[]> =>
    httpClient.get(
      `/AssignmentGroupInvitation/classes/${classId}/assignments/${assignmentId}/invitations-received`
    ),

  // GET /api/AssignmentGroupInvitation/classes/{classId}/assignments/{assignmentId}/invitations-sent
  // Lấy danh sách lời mời đã gửi trong bài tập
  getSentInvitations: (
    classId: number,
    assignmentId: number
  ): Promise<AssignmentGroupInvitationResponse[]> =>
    httpClient.get(
      `/AssignmentGroupInvitation/classes/${classId}/assignments/${assignmentId}/invitations-sent`
    ),

  // POST /api/AssignmentGroupInvitation/invitations/{invitationId}/accept
  // Chấp nhận lời mời
  accept: (invitationId: number): Promise<void> =>
    httpClient.post(`/AssignmentGroupInvitation/invitations/${invitationId}/accept`),

  // POST /api/AssignmentGroupInvitation/invitations/{invitationId}/reject
  // Từ chối lời mời
  reject: (invitationId: number): Promise<void> =>
    httpClient.post(`/AssignmentGroupInvitation/invitations/${invitationId}/reject`),

  // DELETE /api/AssignmentGroupInvitation/invitations/{invitationId}/cancel
  // Hủy lời mời đã gửi
  cancel: (invitationId: number): Promise<void> =>
    httpClient.delete(`/AssignmentGroupInvitation/invitations/${invitationId}/cancel`),
};