import { AttachmentResponse } from "./assignment";
import { AssignmentGroupResponse } from "./assignmentGroup";
import { GradeResponse } from "./grade";
import {
  CreateQuizAnswerRequest,
  QuizAnswer,
  QuizAnswerResponse,
} from "./quiz";

export interface CreateSubmissionRequest {
  content?: string;
  documentIds: number[];
  answers: CreateQuizAnswerRequest[];
}

export interface CreateSubmissionResponse {
  id: number;
  submitById: number;
  submittedTime?: Date;
  content?: string;
  submittedFiles: AttachmentResponse[];
  status: SubmissionStatus;
  answers: QuizAnswerResponse[];
  assignmentGroup: AssignmentGroupResponse | null;
}

export interface UpdateSubmissionRequest {
  id: number;
  content?: string;
  documentIds: number[];
}

export interface SubmissionResponse {
  id: number;
  submitById: number;
  submitByName?: string;
  submitByAvatarUrl?: string
  submitByEmail?: string;
  submittedTime?: Date;
  content?: string;
  submittedFiles: AttachmentResponse[];
  status: SubmissionStatus;
  grade?: GradeResponse;
  answers: QuizAnswer[];
  assignmentGroup: AssignmentGroupResponse | null;
}

export enum SubmissionStatus {
  NotSubmitted = 0,
  Submitted = 1,
  Graded = 2,
}

// Statistics for grading progress and scores of an assignment
export interface GradingStatistics {
  totalSubmissions: number;
  gradedSubmissions: number;
  ungradedSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  gradingProgress: number; // percentage 0..100
}
