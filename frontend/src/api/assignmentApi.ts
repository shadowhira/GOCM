import httpClient from "@/lib/axios";
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

export const assignmentApi = {
  // POST /api/Assignment/classes/{classId} - Tạo assignment trong class
  create: (
    classId: number,
    data: CreateAssignmentRequest
  ): Promise<AssignmentDetailResponse> =>
    httpClient.post(`/Assignment/classes/${classId}`, data),

  // GET /api/Assignment/All - Lấy tất cả assignments
  getAll: (): Promise<AssignmentResponse[]> =>
    httpClient.get("/Assignment/All"),

  // GET /api/Assignment/assignments - Lấy danh sách assignments được phân trang
  getList: (
    params: GetPaginatedAssignmentsRequest
  ): Promise<PaginatedAssignmentResponse> =>
    httpClient.get("/Assignment/assignments", { params }),

  // GET /api/Assignment/{id} - Lấy assignment theo ID
  getById: (id: number): Promise<AssignmentResponse> =>
    httpClient.get(`/Assignment/${id}`),

  // GET /api/Assignment/classes/{classId}/All - Lấy tất cả assignments theo class ID
  getAllByClassId: (classId: number): Promise<AssignmentResponse[]> =>
    httpClient.get(`/Assignment/classes/${classId}/All`),

  // GET /api/Assignment/classes/{classId}/assignmets - Lấy assignments theo class ID có phân trang
  getListByClassId: (
    classId: number,
    params: GetPaginatedAssignmentsRequest
  ): Promise<PaginatedAssignmentResponse> =>
    httpClient.get(`/Assignment/classes/${classId}/assignments`, { params }),

  // GET /api/Assignment/classes/{classId}/assignments/{assignmentId}/full - Lấy assignment với đầy đủ thông tin (bao gồm đáp án đúng) - Chỉ dành cho teacher
  getFullForTeacher: (
    classId: number,
    assignmentId: number
  ): Promise<AssignmentDetailResponse> =>
    httpClient.get(
      `/Assignment/classes/${classId}/assignments/${assignmentId}/full`
    ),

  // GET /api/Assignment/classes/{classId}/assignments/unsubmitted/count - Lấy số lượng assignment chưa nộp của người dùng trong class
  getCountUnsubmittedByUserInClass: (classId: number): Promise<AssignmentUnsubmittedCountResponse> =>
    httpClient.get(
      `/Assignment/classes/${classId}/assignments/unsubmitted/count`
    ),

  // PUT /api/Assignment/classes/{classId}/assignments/{assignmentId} - Cập nhật assignment
  update: (
    classId: number,
    assignmentId: number,
    data: UpdateAssignmentRequest
  ): Promise<AssignmentDetailResponse> =>
    httpClient.put(`/Assignment/classes/${classId}/assignments/${assignmentId}`, data),

  // PUT /api/Assignment/{assignmentId}/allow-show-result-to-student - Cho phép hiển thị kết quả cho sinh viên
  allowShowResultToStudent: (
    assignmentId: number,
    data: AllowShowResultToStudentRequest
  ): Promise<void> =>
    httpClient.put(`/Assignment/${assignmentId}/allow-show-result-to-student`, data),

  // DELETE /api/Assignment/{assignmentId} - Xóa assignment
  remove: (assignmentId: number): Promise<void> =>
    httpClient.delete(`/Assignment/${assignmentId}`),

  // POST /api/Assignment/classes/{classId}/excel - Tạo assignment từ file Excel
  createFromExcel: (
    classId: number,
    excelFile: File,
    data: CreateAssignmentFromExcelRequest
  ): Promise<AssignmentDetailResponse> => {
    const formData = new FormData();
    formData.append("excelFile", excelFile);
    formData.append("title", data.title);
    if (data.content) {
      formData.append("content", data.content);
    }
    formData.append("deadline", data.deadline.toISOString());

    // Add attachedDocumentIds if any
    if (data.attachedDocumentIds && data.attachedDocumentIds.length > 0) {
      data.attachedDocumentIds.forEach((documentId, index) => {
        formData.append(`attachedDocumentIds[${index}]`, documentId.toString());
      });
    }

    return httpClient.post(`/Assignment/classes/${classId}/excel`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
