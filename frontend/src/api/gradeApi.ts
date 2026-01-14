import httpClient from "@/lib/axios";
import { StudentAverageGrade } from "@/schemas/gradeSchema";
import { AssignmentGradeDetail, ClassGradeOverview, CreateGradeRequest, PaginatedAssignmentGradeSummary, StudentGradesSummary } from "@/types/grade";
import { SubmissionResponse } from "@/types/submission";

export const gradeApi = {
      // POST /api/Submission/submissions/{submissionId}/grade
  grade: (
    submissionId: number,
    data: CreateGradeRequest
  ): Promise<SubmissionResponse> =>
    httpClient.post(`/Grade/submissions/${submissionId}`, data),

    // Teacher View APIs
  // GET /api/Grade/class/{classId}/overview
  getClassGradeOverview: (classId: number): Promise<ClassGradeOverview> =>
    httpClient.get(`/Grade/class/${classId}/overview`),

  // GET /api/Grade/class/{classId}/students/averages
  getStudentAverageGrades: (classId: number): Promise<StudentAverageGrade[]> =>
    httpClient.get(`/Grade/class/${classId}/students/averages`),

  // GET /api/Grade/class/{classId}/assignments?PageNumber=1&PageSize=10&Keyword=search
  getAssignmentGradeSummaries: (
    classId: number,
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm: string = ""
  ): Promise<PaginatedAssignmentGradeSummary> =>
    httpClient.get(`/Grade/class/${classId}/assignments`, {
      params: {
        PageNumber: pageNumber,
        PageSize: pageSize,
        SearchTerm: searchTerm,
      },
    }),

  // GET /api/Grade/class/{classId}/assignments/{assignmentId}/details
  getAssignmentGradeDetails: (
    classId: number,
    assignmentId: number
  ): Promise<AssignmentGradeDetail> =>
    httpClient.get(
      `/Grade/class/${classId}/assignments/${assignmentId}/details`
    ),

  // Student View APIs
  // GET /api/Grade/class/{classId}/student/my-grades
  getMyGrades: (classId: number): Promise<StudentGradesSummary> =>
    httpClient.get(`/Grade/class/${classId}/student/my-grades`),
}