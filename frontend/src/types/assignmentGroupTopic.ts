import type { AssignmentGroupApprovalRequestResponse, AssignmentGroupResponse } from './assignmentGroup';

// ============ ENTITIES ============
export interface AssignmentGroupTopic {
  id: number;
  title: string;
  maxGroupsPerTopic: number;
  description?: string | null;
  maxMembers: number;
  minMembers: number;
  createdAt: Date;
  updatedAt: Date;
  assignmentGroups: AssignmentGroupResponse[];
  approvalRequests?: AssignmentGroupApprovalRequestResponse[] | null;
}

// ============ REQUEST TYPES ============
export interface CreateAssignmentGroupTopicRequest {
  title: string;
  maxGroupsPerTopic: number;
  description?: string | null;
  maxMembers: number;
  minMembers: number;
}

export interface UpdateAssignmentGroupTopicRequest {
  title?: string | null;
  maxGroupsPerTopic?: number | null;
  description?: string | null;
  maxMembers?: number | null;
  minMembers?: number | null;
}

// ============ RESPONSE TYPES ============
export interface AssignmentGroupTopicResponse {
  id: number;
  title: string;
  maxGroupsPerTopic: number;
  description?: string | null;
  maxMembers: number;
  minMembers: number;
  assignmentGroups?: AssignmentGroupResponse[] | null;
  approvalRequests?: AssignmentGroupApprovalRequestResponse[] | null;
  createdAt: Date;
  updatedAt: Date;
}