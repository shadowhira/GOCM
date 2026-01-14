import type { ClassMemberResponse } from './class';

// ============ ENUMS ============
export enum AssignmentGroupInvitationStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
}

// ============ ENTITIES ============
export interface AssignmentGroupInvitation {
  id: number;
  fromMember: ClassMemberResponse;
  toMember: ClassMemberResponse;
  status: AssignmentGroupInvitationStatus;
  sentAt: Date;
  respondedAt?: Date | null;
}

// ============ REQUEST TYPES ============
export interface CreateAssignmentGroupInvitationRequest {
    fromMemberId: number;
    toMemberId: number;
}

// ============ RESPONSE TYPES ============
export interface AssignmentGroupInvitationResponse {
  id: number;
  fromMember: ClassMemberResponse;
  toMember: ClassMemberResponse;
  status: AssignmentGroupInvitationStatus;
  sentAt: Date;
  respondedAt?: Date | null;
}