import httpClient from '@/lib/axios';
import type {
  CreateAssignmentGroupRequest,
  UpdateAssignmentGroupRequest,
  RejectAssignmentGroupRequest,
  AssignmentGroupResponse,
  AssignmentGroupApprovalRequestResponse,
} from '@/types/assignmentGroup';

export const assignmentGroupApi = {
  // POST /api/AssignmentGroup/classes/{classId}/assignments/{assignmentId} - Tạo nhóm bài tập
  create: (
    classId: number,
    assignmentId: number,
    data: CreateAssignmentGroupRequest
  ): Promise<AssignmentGroupResponse> =>
    httpClient.post(
      `/AssignmentGroup/classes/${classId}/assignments/${assignmentId}`,
      data
    ),

  // POST /api/AssignmentGroup/{assignmentGroupId}/leave - Rời khỏi nhóm
  leave: (assignmentGroupId: number): Promise<void> =>
    httpClient.post(`/AssignmentGroup/${assignmentGroupId}/leave`),

  // POST /api/AssignmentGroup/{assignmentGroupId}/join - Tham gia nhóm
  join: (assignmentGroupId: number): Promise<void> =>
    httpClient.post(`/AssignmentGroup/${assignmentGroupId}/join`),

  // POST /api/AssignmentGroup/{assignmentGroupId}/members/{memberId}/invite - Mời thành viên vào nhóm
  inviteMember: (assignmentGroupId: number, memberId: number): Promise<void> =>
    httpClient.post(
      `/AssignmentGroup/${assignmentGroupId}/members/${memberId}/invite`
    ),

  // POST /api/AssignmentGroup/{assignmentGroupId}/members/{memberId}/remove - Xóa thành viên khỏi nhóm
  removeMember: (assignmentGroupId: number, memberId: number): Promise<void> =>
    httpClient.post(
      `/AssignmentGroup/${assignmentGroupId}/members/${memberId}/remove`
    ),

  // POST /api/AssignmentGroup/{assignmentGroupId}/members/{memberId}/transfer-leadership - Chuyển quyền lãnh đạo nhóm
  transferLeadership: (
    assignmentGroupId: number,
    memberId: number
  ): Promise<void> =>
    httpClient.post(
      `/AssignmentGroup/${assignmentGroupId}/members/${memberId}/transfer-leadership`
    ),

  // PUT /api/AssignmentGroup/{assignmentGroupId} - Cập nhật thông tin nhóm
  update: (
    assignmentGroupId: number,
    data: UpdateAssignmentGroupRequest
  ): Promise<AssignmentGroupResponse> =>
    httpClient.put(`/AssignmentGroup/${assignmentGroupId}`, data),

  // GET /api/AssignmentGroup/classes/{classId}/assignments/{assignmentId}/All - Lấy tất cả nhóm của bài tập
  getAllByAssignment: (
    classId: number,
    assignmentId: number
  ): Promise<AssignmentGroupResponse[]> =>
    httpClient.get(
      `/AssignmentGroup/classes/${classId}/assignments/${assignmentId}/All`
    ),

  // GET /api/AssignmentGroup/{assignmentGroupId} - Lấy thông tin chi tiết nhóm
  getById: (assignmentGroupId: number): Promise<AssignmentGroupResponse> =>
    httpClient.get(`/AssignmentGroup/${assignmentGroupId}`),

  // GET /api/AssignmentGroup/classes/{classId}/assignments/{assignmentId}/my-group - Lấy nhóm của user hiện tại
  getMyGroup: async (
    classId: number,
    assignmentId: number
  ): Promise<AssignmentGroupResponse | null> => {
    try {
      return await httpClient.get(
        `/AssignmentGroup/classes/${classId}/assignments/${assignmentId}/my-group`
      );
    } catch {
      return null; // Trả về null nếu chưa có nhóm
    }
  },

  // GET /api/AssignmentGroup/classes/{classId}/assignments/{assignmentId}/approval-requests - Lấy tất cả approval requests
  getApprovalRequests: (
    classId: number,
    assignmentId: number
  ): Promise<AssignmentGroupApprovalRequestResponse[]> =>
    httpClient.get(
      `/AssignmentGroup/classes/${classId}/assignments/${assignmentId}/approval-requests`
    ),

  // POST /api/AssignmentGroup/{assignmentGroupId}/request-approval - Yêu cầu duyệt nhóm
  requestApproval: (assignmentGroupId: number, topicId: number): Promise<void> =>
    httpClient.post(`/AssignmentGroup/${assignmentGroupId}/request-approval`, null, {
      params: { topicId },
    }),

  // POST /api/AssignmentGroup/assignmentGroupApprovalRequest/{approvalRequestId}/accept - Chấp nhận yêu cầu tạo nhóm
  acceptRequest: (approvalRequestId: number): Promise<void> =>
    httpClient.post(`/AssignmentGroup/assignmentGroupApprovalRequest/${approvalRequestId}/accept`),

  // POST /api/AssignmentGroup/assignmentGroupApprovalRequest/{approvalRequestId}/reject - Từ chối yêu cầu tạo nhóm
  rejectRequest: (
    approvalRequestId: number,
    data: RejectAssignmentGroupRequest
  ): Promise<void> =>
    httpClient.post(
      `/AssignmentGroup/assignmentGroupApprovalRequest/${approvalRequestId}/reject`,
      data
    ),
};