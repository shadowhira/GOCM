import { RewardPointRules } from "@/config/rewardPointRules";

export const LIVE_ROOM_REWARD_PRESETS = [
  {
    key: "LiveRoomQuickBonus",
    translationKey: "live_room_reward_option_bonus",
    points: RewardPointRules.activities.LiveRoomQuickBonus,
  },
  {
    key: "ManualPenalty",
    translationKey: "live_room_reward_option_penalty",
    points: RewardPointRules.activities.ManualPenalty,
  },
] as const;

export type LiveRoomRewardPresetKey =
  (typeof LIVE_ROOM_REWARD_PRESETS)[number]["key"];
