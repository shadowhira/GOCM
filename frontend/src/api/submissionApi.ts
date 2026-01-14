import httpClient from "@/lib/axios";
import type {
  CreateSubmissionRequest,
  CreateSubmissionResponse,
  SubmissionResponse,
  GradingStatistics,
} from "@/types/submission";

export const submissionApi = {
  // POST /api/Submission/classes/{classId}/assignments/{assignmentId}/submissions
  create: (
    classId: number,
    assignmentId: number,
    data: CreateSubmissionRequest
  ): Promise<CreateSubmissionResponse> =>
    httpClient.post(
      `/Submission/classes/${classId}/assignments/${assignmentId}/submissions`,
      data
    ),

  // GET /api/Submission/assignments/{assignmentId}/submissions
  getByAssignment: (assignmentId: number): Promise<SubmissionResponse[]> =>
    httpClient.get(`/Submission/assignments/${assignmentId}/submissions`),

  // GET /api/Submission/classes/{classId}/assignments/{assignmentId}/teacher/submissions
  getByAssignmentAndClass: (
    classId: number,
    assignmentId: number
  ): Promise<SubmissionResponse[]> =>
    httpClient.get(
      `/Submission/classes/${classId}/assignments/${assignmentId}/teacher/submissions`
    ),

  // GET /api/Submission/submissions/{submissionId}
  getById: (submissionId: number): Promise<SubmissionResponse> =>
    httpClient.get(`/Submission/submissions/${submissionId}`),

  // GET /api/Submission/classes/{classId}/assignments/{assignmentId}/student/submission - Lấy submission an toàn cho học sinh
  getSafeSubmissionForStudent: (
    classId: number,
    assignmentId: number
  ): Promise<CreateSubmissionResponse> =>
    httpClient.get(
      `/Submission/classes/${classId}/assignments/${assignmentId}/student/submission`
    ),

  // GET /api/Submission/submissions/ungraded
  getUngraded: (): Promise<SubmissionResponse[]> =>
    httpClient.get("/Submission/submissions/ungraded"),

  // GET /api/Submission/assignments/{assignmentId}/grading-statistics
  getGradingStatistics: (assignmentId: number): Promise<GradingStatistics> =>
    httpClient.get(
      `/Submission/assignments/${assignmentId}/grading-statistics`
    ),

  // PUT /api/Submission/classes/{classId}/assignments/{assignmentId}/submissions
  update: (
    classId: number,
    assignmentId: number,
    data: { id: number; content?: string; documentIds: number[] }
  ): Promise<SubmissionResponse> =>
    httpClient.put(
      `/Submission/classes/${classId}/assignments/${assignmentId}/submissions`,
      data
    ),

  // DELETE /api/Submission/assignments/{assignmentId}/submissions/{submissionId}
  cancel: (assignmentId: number, submissionId: number): Promise<{ success: boolean; message: string }> =>
    httpClient.delete(
      `/Submission/assignments/${assignmentId}/submissions/${submissionId}`
    ),
};

export default submissionApi;
