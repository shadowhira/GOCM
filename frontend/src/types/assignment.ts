import {
  AssignmentStatus,
  AssignmentType,
  FileType,
  ParentType,
} from "./constants";
import {
  CreateQuizQuestionRequest,
  QuizQuestionResponse,
  UpdateQuizQuestionRequest,
  QuizQuestion,
} from "./quiz";
import { SubmissionStatus } from "./submission";

export interface AttachmentResponse {
  id: number;
  publicUrl?: string;
  fileName: string;
  fileType: FileType;
  updatedAt: string;
  parentType: ParentType;
  parentId: number;
}

export interface CreateAttachmentRequest {
  publicUrl?: string;
  fileName: string;
  fileType: FileType;
}

export interface UpdateAttachmentRequest extends CreateAttachmentRequest {
  id: number;
}

export interface AssignmentResponse {
  id: number;
  title: string;
  content?: string;
  attachments?: AttachmentResponse[];
  deadline: Date;
  maxScore: number;
  type: AssignmentType;
  listQuestions?: QuizQuestionResponse[];
  createdAt: string;
  status: AssignmentStatus;
  submissionStatus?: SubmissionStatus;
  allowShowResultToStudent: boolean;
}

export interface AssignmentDetailResponse {
  id: number;
  title: string;
  content?: string;
  attachments?: AttachmentResponse[];
  deadline: Date;
  maxScore: number;
  type: AssignmentType;
  listQuestions?: QuizQuestion[];
  createdAt: string;
  status: AssignmentStatus;
  submissionStatus?: SubmissionStatus;
  // Additional details for full assignment view
  submissionsCount?: number;
  totalStudents?: number;
  classId?: number;
  className?: string;
  allowShowResultToStudent: boolean;
}

export interface AllowShowResultToStudentRequest {
  allowShowResultToStudent: boolean;
}

export interface CreateAssignmentRequest {
  title: string;
  content?: string;
  attachedDocumentIds?: number[];
  deadline: Date;
  maxScore: number;
  type: AssignmentType;
  listQuestions?: CreateQuizQuestionRequest[];
}

export interface UpdateAssignmentRequest {
  title: string;
  content?: string;
  attachedDocumentIds?: number[];
  deadline: Date;
  maxScore: number;
  type: AssignmentType;
  listQuestions?: UpdateQuizQuestionRequest[];
}

export interface CreateAssignmentFromExcelRequest {
  title: string;
  content?: string;
  deadline: Date;
  attachedDocumentIds?: number[];
}

export interface GetPaginatedAssignmentsRequest {
  pageNumber: number;
  pageSize: number;
  title?: string;
  type?: AssignmentType;
  excludeType?: AssignmentType;
}

export interface PaginatedAssignmentResponse {
  items: AssignmentResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// UI-specific types
export interface AssignmentCardData {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  points?: number;
  submissionsCount?: number;
  totalStudents?: number;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "assigned" | "submitted" | "overdue";
  type: AssignmentType;
  createdAt: string;
}

export interface Assignment {
  id?: number;
  title: string;
  content?: string;
  deadline: Date;
  maxScore: number;
  type: AssignmentType;
  attachments?: AttachmentResponse[];
  listQuestions?: QuizQuestion[];
  createdAt?: string;
  status?: AssignmentStatus;
  submissionStatus?: SubmissionStatus;
  allowShowResultToStudent: boolean;
}

// Filter and sort options
export interface AssignmentFilters {
  status?: AssignmentStatus[];
  type?: AssignmentType[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  classId?: number;
}

export interface AssignmentSortOptions {
  field: "title" | "deadline" | "createdAt" | "maxScore";
  direction: "asc" | "desc";
}

export interface AssignmentUnsubmittedCountResponse {
  assignmentUnsubmittedCount: number;
  groupAssignmentUnsubmittedCount: number;
}