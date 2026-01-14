import { ActivityPoints, Thresholds } from './pointSystem'

/**
 * Re-export reward point rules from centralized pointSystem
 * This file is kept for backward compatibility with existing imports
 */
export const RewardPointRules = {
  activities: {
    LiveRoomQuickBonus: ActivityPoints.LIVE_ROOM_QUICK_BONUS,
    ManualPenalty: -ActivityPoints.MANUAL_PENALTY,
    OnTimeSubmission: ActivityPoints.ON_TIME_SUBMISSION,
    HighGradeBonus: ActivityPoints.HIGH_GRADE_BONUS,
  },
  thresholds: {
    HighGradeScore: Thresholds.HIGH_GRADE_SCORE,
  },
} as const;

export const formatRewardPoints = (value: number) =>
  value > 0 ? `+${value}` : `${value}`;
