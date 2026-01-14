import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/userApi'
import type { UpdateUserProfileRequest } from '@/types/user'
import { adminKeys } from '@/queries/adminQueries'

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateUserProfileRequest) => userApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() })
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      return updatedUser
    },
  })
}
