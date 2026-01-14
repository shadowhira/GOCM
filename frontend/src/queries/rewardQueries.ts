import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rewardApi } from '@/api/rewardApi'
import type { GrantRewardRequest, RewardActivityResponse } from '@/types/reward'
import type { GrantLiveRoomParticipantRewardRequest } from '@/types/liveRoom'
import { classKeys } from './classQueries'
import { participantKeys } from './liveRoomQueries'

interface GrantPostRewardVariables {
  classId: number
  postId: number
  data: GrantRewardRequest
}

interface GrantCommentRewardVariables {
  classId: number
  commentId: number
  data: GrantRewardRequest
}

interface GrantLiveRoomParticipantRewardVariables {
  liveRoomId: number
  participantId: number
  payload: GrantLiveRoomParticipantRewardRequest
}

export const useGrantPostReward = () => {
  const queryClient = useQueryClient()

  return useMutation<RewardActivityResponse, unknown, GrantPostRewardVariables>({
    mutationFn: ({ classId, postId, data }) => rewardApi.grantPostReward(classId, postId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.members(variables.classId) })
    },
  })
}

export const useGrantCommentReward = () => {
  const queryClient = useQueryClient()

  return useMutation<RewardActivityResponse, unknown, GrantCommentRewardVariables>({
    mutationFn: ({ classId, commentId, data }) => rewardApi.grantCommentReward(classId, commentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.members(variables.classId) })
    },
  })
}

export const useGrantLiveRoomParticipantReward = () => {
  const queryClient = useQueryClient()

  return useMutation<RewardActivityResponse, unknown, GrantLiveRoomParticipantRewardVariables>({
    mutationFn: ({ liveRoomId, participantId, payload }) =>
      rewardApi.grantParticipantReward(liveRoomId, participantId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: participantKeys.roomParticipants(variables.liveRoomId),
      })
    },
  })
}
