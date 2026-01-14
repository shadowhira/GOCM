export interface CreateGradeRequest {
  score: number;
  feedback?: string;
}

export interface GradeResponse {
  id: number;
  score: number;
  feedback?: string;
  gradeAt: Date;
  gradedById?: number;
}

export interface StudentAverageGrade {
  studentId: number;
  studentName: string;
  studentAvatarUrl?: string;
  averageScore: number;
  totalAssignments: number;
  submittedCount: number;
  gradedCount: number;
}

export interface ClassGradeOverview {
  classId: number;
  className: string;
  totalStudents: number;
  totalAssignments: number;
  averageClassScore: number;
  averageClassPercentage: number;
  highestScore: number;
  lowestScore: number;
  gradingProgress: number;
}

export interface AssignmentGradeSummary {
  assignmentId: number;
  assignmentTitle: string;
  assignmentType: string;
  maxScore: number;
  dueDate: string | null;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  gradingProgress: number;
}

export interface PaginatedAssignmentGradeSummary {
  items: AssignmentGradeSummary[];
  pageIndex: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AssignmentGradeDetail {
  assignmentId: number;
  assignmentTitle: string;
  assignmentType: string;
  maxScore: number;
  dueDate: string | null;
  studentGrades: StudentGrade[];
}

export interface StudentGrade {
  studentId: number;
  studentName: string;
  submissionId: number | null;
  submittedAt: Date | null;
  score: number | null;
  normalizedScore: number | null;
  percentage: number | null;
  status: "graded" | "pending" | "not_submitted";
  feedback: string | null;
}

// Student View Types
export interface StudentAssignmentGrade {
  assignmentId: number;
  assignmentTitle: string;
  assignmentType: string;
  maxScore: number;
  dueDate: string | null;
  submissionId: number | null;
  submittedAt: string | null;
  score: number | null;
  normalizedScore: number | null;
  percentage: number | null;
  status: "graded" | "pending" | "not_submitted";
  feedback: string | null;
}

export interface StudentGradesSummary {
  studentId: number;
  studentName: string;
  classId: number;
  className: string;
  averageScore: number;
  averagePercentage: number;
  totalAssignments: number;
  gradedCount: number;
  pendingCount: number;
  notSubmittedCount: number;
  assignments: StudentAssignmentGrade[];
}