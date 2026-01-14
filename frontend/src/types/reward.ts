import { RewardRanges } from '@/config/pointSystem'

export enum ActivityType {
  PostContribution = 0,
  CommentContribution = 1,
  InitialLiveRoomJoin = 2,
  ManualPenalty = 3,
  LiveRoomQuickBonus = 4,
  OnTimeSubmission = 5,
  HighGrade = 6,
}

export enum ParentType {
  Assignment = 0,
  Post = 1,
  Comment = 2,
  Submission = 3,
  LiveRoom = 4,
}

export interface RewardActivityResponse {
  id: number;
  classId: number;
  targetUserId: number;
  targetUserName: string;
  activityType: ActivityType;
  points: number;
  parentType: ParentType | null;
  parentId: number | null;
  reason?: string | null;
  createdAt: string;
}

export interface GrantRewardRequest {
  points: number;
  reason?: string;
}

/**
 * Reward point defaults derived from centralized pointSystem config
 */
export const RewardPointDefaults = {
  post: RewardRanges.post.default,
  comment: RewardRanges.comment.default,
  min: RewardRanges.manual.min,
  max: RewardRanges.manual.max,
  // Add context-specific ranges
  postMin: RewardRanges.post.min,
  postMax: RewardRanges.post.max,
  commentMin: RewardRanges.comment.min,
  commentMax: RewardRanges.comment.max,
} as const;
