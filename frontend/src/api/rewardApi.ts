import httpClient from '@/lib/axios'
import type { GrantRewardRequest, RewardActivityResponse } from '@/types/reward'
import type { GrantLiveRoomParticipantRewardRequest } from '@/types/liveRoom'

export const rewardApi = {
  grantPostReward: (classId: number, postId: number, data: GrantRewardRequest): Promise<RewardActivityResponse> =>
    httpClient.post(`/Reward/classes/${classId}/posts/${postId}/rewards`, data),

  grantCommentReward: (classId: number, commentId: number, data: GrantRewardRequest): Promise<RewardActivityResponse> =>
    httpClient.post(`/Reward/classes/${classId}/comments/${commentId}/rewards`, data),

  grantParticipantReward: (
    liveRoomId: number,
    participantId: number,
    payload: GrantLiveRoomParticipantRewardRequest
  ): Promise<RewardActivityResponse> =>
    httpClient.post(
      `/Reward/live-rooms/${liveRoomId}/participants/${participantId}/rewards`,
      payload
    ),
}
