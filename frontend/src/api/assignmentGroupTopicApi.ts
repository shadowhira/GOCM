import httpClient from '@/lib/axios';
import type {
  CreateAssignmentGroupTopicRequest,
  UpdateAssignmentGroupTopicRequest,
  AssignmentGroupTopicResponse,
} from '@/types/assignmentGroupTopic';

export const assignmentGroupTopicApi = {
  // POST /api/AssignmentGroupTopic/classes/{classId}/assignments/{assignmentId}/group-topics
  // Tạo chủ đề nhóm cho bài tập
  create: (
    classId: number,
    assignmentId: number,
    data: CreateAssignmentGroupTopicRequest
  ): Promise<AssignmentGroupTopicResponse> =>
    httpClient.post(
      `/AssignmentGroupTopic/classes/${classId}/assignments/${assignmentId}/group-topics`,
      data
    ),

  // PUT /api/AssignmentGroupTopic/{topicId}
  // Cập nhật chủ đề nhóm
  update: (
    topicId: number,
    data: UpdateAssignmentGroupTopicRequest
  ): Promise<AssignmentGroupTopicResponse> =>
    httpClient.put(`/AssignmentGroupTopic/${topicId}`, data),

  // DELETE /api/AssignmentGroupTopic/{topicId}
  // Xóa chủ đề nhóm
  remove: (topicId: number): Promise<void> =>
    httpClient.delete(`/AssignmentGroupTopic/${topicId}`),

  // GET /api/AssignmentGroupTopic/{topicId}
  // Lấy thông tin chi tiết chủ đề nhóm
  getById: (topicId: number): Promise<AssignmentGroupTopicResponse> =>
    httpClient.get(`/AssignmentGroupTopic/${topicId}`),

  // GET /api/AssignmentGroupTopic/groups/{groupId}/topic
  // Lấy chủ đề nhóm theo nhóm
  getByGroupId: (groupId: number): Promise<AssignmentGroupTopicResponse> =>
    httpClient.get(`/AssignmentGroupTopic/groups/${groupId}/topic`),

  // GET /api/AssignmentGroupTopic/classes/{classId}/assignments/{assignmentId}/group-topics
  // Lấy tất cả chủ đề nhóm của bài tập
  getAllByAssignment: (
    classId: number,
    assignmentId: number
  ): Promise<AssignmentGroupTopicResponse[]> =>
    httpClient.get(
      `/AssignmentGroupTopic/classes/${classId}/assignments/${assignmentId}/group-topics`
    ),
};