import { AssignmentGroupInvitation, AssignmentGroupInvitationResponse } from './assignmentGroupInvitation';
import { AssignmentGroupTopicResponse } from './assignmentGroupTopic';
import type { ClassMemberResponse } from './class';

// ============ ENUMS ============
export enum AssignmentGroupStatus {
  PendingApproval = 0,
  Approved = 1,
  Rejected = 2,
  Draft = 3,
}

export enum AssignmentGroupApprovalStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}

// ============ ENTITIES ============
export interface AssignmentGroupMember {
  id: number;
  member: ClassMemberResponse;
  isLeader: boolean;
  joinedAt: Date;
}

export interface AssignmentGroup {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: AssignmentGroupStatus;
  groupMembers: AssignmentGroupMember[];
  groupInvitations: AssignmentGroupInvitation[];
  approvalRequests: AssignmentGroupApprovalRequest[];
}

export interface AssignmentGroupApprovalRequest {
  id: number;
  status: AssignmentGroupApprovalStatus;
  rejectReason?: string | null;
  requestedAt: Date;
  respondedAt?: Date | null;
}

// ============ REQUEST TYPES ============
export interface CreateAssignmentGroupRequest {
  name: string;
  assignmentGroupTopicId?: number;
}

export interface UpdateAssignmentGroupRequest {
  name: string;
}

export interface RejectAssignmentGroupRequest {
  reason: string;
}

// ============ RESPONSE TYPES ============
export interface AssignmentGroupMemberResponse {
  id: number;
  member: ClassMemberResponse; 
  isLeader: boolean;
  joinedAt: Date;
}

export interface AssignmentGroupApprovalRequestResponse {
  id: number;
  status: AssignmentGroupApprovalStatus;
  assignmentGroup: AssignmentGroupResponse;
  assignmentGroupTopic: AssignmentGroupTopicResponse;
  rejectReason?: string | null;
  requestedAt: Date;
  respondedAt?: Date | null;
}

export interface AssignmentGroupResponse {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  status: AssignmentGroupStatus;
  groupMembers: AssignmentGroupMemberResponse[];
  groupInvitations: AssignmentGroupInvitationResponse[];
  approvalRequests: AssignmentGroupApprovalRequestResponse[];
  classId: number;
  assignmentId: number;
  assignmentGroupTopicId?: number;
}