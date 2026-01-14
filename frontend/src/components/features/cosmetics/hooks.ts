'use client'

import { useMemo } from 'react'
import type { ClassMemberCosmeticSlotsResponse } from '@/types/class'
import {
  useAppearanceFlags,
  useClassAppearanceSettings,
  useClassMemberCosmetics,
} from '@/store'

interface UseCosmeticContextOptions {
  classId?: number
  classMemberId?: number | null
  cosmeticsOverride?: ClassMemberCosmeticSlotsResponse | null
}

export const useCosmeticContext = ({
  classId,
  classMemberId,
  cosmeticsOverride,
}: UseCosmeticContextOptions) => {
  const safeClassId = classId ?? 0
  const safeMemberId = classMemberId ?? null

  const storedCosmetics = useClassMemberCosmetics(safeClassId, safeMemberId)
  const appearanceFlags = useAppearanceFlags(safeClassId)
  const appearanceSettings = useClassAppearanceSettings(safeClassId)

  const cosmetics = useMemo<ClassMemberCosmeticSlotsResponse | null>(() => {
    if (cosmeticsOverride) {
      return cosmeticsOverride
    }

    return storedCosmetics ?? null
  }, [cosmeticsOverride, storedCosmetics])

  return {
    cosmetics,
    appearance: appearanceSettings,
    flags: appearanceFlags,
  }
}

export type CosmeticContext = ReturnType<typeof useCosmeticContext>

export const useCosmeticSlot = <TKey extends keyof ClassMemberCosmeticSlotsResponse>(
  key: TKey,
  context: CosmeticContext
) => {
  return context.cosmetics?.[key] ?? null
}
