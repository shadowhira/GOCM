import { useEffect } from 'react'
import { useGetClassCosmetics } from '@/queries/classQueries'
import { useSetClassMemberCosmetics } from '@/store'

export const useClassCosmeticsBootstrap = (classId?: number) => {
  const enabled = typeof classId === 'number' && classId > 0
  const { data, isLoading, isFetching } = useGetClassCosmetics(classId ?? 0, { enabled })
  const setClassMemberCosmetics = useSetClassMemberCosmetics()

  useEffect(() => {
    if (!enabled || !data?.length) {
      return
    }

    setClassMemberCosmetics(classId as number, data)
  }, [classId, data, enabled, setClassMemberCosmetics])

  return {
    cosmetics: data ?? null,
    isLoading,
    isFetching,
  }
}
