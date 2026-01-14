import { useMemo } from 'react'
import { create } from 'zustand'
import type {
  ClassAppearanceSettingsResponse,
  ClassMemberCosmeticResponse,
  ClassMemberCosmeticSlotsResponse,
  ClassMemberResponse,
} from '@/types/class'

export type ClassAppearanceMap = Record<number, ClassAppearanceSettingsResponse | undefined>
export type ClassMemberCosmeticsMap = Record<number, Record<number, ClassMemberCosmeticSlotsResponse | null>>

interface ClassCosmeticsState {
  appearanceSettings: ClassAppearanceMap
  memberCosmetics: ClassMemberCosmeticsMap
  setAppearanceSettings: (classId: number, payload: ClassAppearanceSettingsResponse) => void
  setMemberCosmetics: (classId: number, payload: ClassMemberCosmeticResponse[]) => void
  upsertMemberCosmetic: (classId: number, payload: ClassMemberCosmeticResponse) => void
  hydrateFromMembers: (classId: number, members: ClassMemberResponse[] | undefined) => void
  clearMemberCosmetics: (classId: number) => void
}

const extractSlots = (
  payload: ClassMemberCosmeticResponse | ClassMemberCosmeticSlotsResponse | null | undefined
): ClassMemberCosmeticSlotsResponse | null => {
  if (!payload) {
    return null
  }

  const { avatarFrame = null, chatFrame = null, badge = null } = payload
  return {
    avatarFrame,
    chatFrame,
    badge,
  }
}

const mapListToRecord = (items: ClassMemberCosmeticResponse[]): Record<number, ClassMemberCosmeticSlotsResponse | null> => {
  return items.reduce<Record<number, ClassMemberCosmeticSlotsResponse | null>>((acc, item) => {
    acc[item.classMemberId] = extractSlots(item)
    return acc
  }, {})
}

export const useClassCosmeticsStore = create<ClassCosmeticsState>((set) => ({
  appearanceSettings: {},
  memberCosmetics: {},
  setAppearanceSettings: (classId, payload) =>
    set((state) => ({
      appearanceSettings: {
        ...state.appearanceSettings,
        [classId]: payload,
      },
    })),
  setMemberCosmetics: (classId, payload) =>
    set((state) => ({
      memberCosmetics: {
        ...state.memberCosmetics,
        [classId]: mapListToRecord(payload),
      },
    })),
  upsertMemberCosmetic: (classId, payload) =>
    set((state) => ({
      memberCosmetics: {
        ...state.memberCosmetics,
        [classId]: {
          ...(state.memberCosmetics[classId] ?? {}),
          [payload.classMemberId]: extractSlots(payload),
        },
      },
    })),
  hydrateFromMembers: (classId, members) =>
    set((state) => {
      if (!members || members.length === 0) {
        return state
      }

      const classMap = { ...(state.memberCosmetics[classId] ?? {}) }
      let changed = false

      members.forEach((member) => {
        if (!member?.id) {
          return
        }

        if (!('cosmetics' in member)) {
          return
        }

        const slots = extractSlots(member.cosmetics ?? null)
        if (slots === null) {
          return
        }

        const previous = classMap[member.id]
        const hasDelta =
          !previous ||
          previous.avatarFrame !== slots.avatarFrame ||
          previous.chatFrame !== slots.chatFrame ||
          previous.badge !== slots.badge

        if (hasDelta) {
          classMap[member.id] = slots
          changed = true
        }
      })

      if (!changed) {
        return state
      }

      return {
        memberCosmetics: {
          ...state.memberCosmetics,
          [classId]: classMap,
        },
      }
    }),
  clearMemberCosmetics: (classId) =>
    set((state) => {
      if (!state.memberCosmetics[classId]) {
        return state
      }

      const next = { ...state.memberCosmetics }
      delete next[classId]

      return {
        memberCosmetics: next,
      }
    }),
}))

const DEFAULT_APPEARANCE_FLAGS = {
  showAvatarFrames: true,
  showChatFrames: true,
  showBadges: true,
}

const EMPTY_MEMBER_COSMETICS: Record<number, ClassMemberCosmeticSlotsResponse | null> = Object.freeze({})

// Selectors & helpers
export const useClassAppearanceSettings = (classId: number) =>
  useClassCosmeticsStore((state) => state.appearanceSettings[classId])

export const useAppearanceFlags = (classId: number) => {
  const settings = useClassCosmeticsStore((state) => state.appearanceSettings[classId])

  return useMemo(() => {
    if (!settings) {
      return DEFAULT_APPEARANCE_FLAGS
    }

    return {
      showAvatarFrames: settings.showAvatarFrames,
      showChatFrames: settings.showChatFrames,
      showBadges: settings.showBadges,
    }
  }, [settings])
}

export const useClassMemberCosmetics = (classId: number, classMemberId?: number | null) =>
  useClassCosmeticsStore((state) => {
    if (!classMemberId) {
      return null
    }

    return state.memberCosmetics[classId]?.[classMemberId] ?? null
  })

export const useClassMemberCosmeticsMap = (classId: number) => {
  const map = useClassCosmeticsStore((state) => state.memberCosmetics[classId])
  return map ?? EMPTY_MEMBER_COSMETICS
}

export const useSetClassAppearanceSettings = () =>
  useClassCosmeticsStore((state) => state.setAppearanceSettings)

export const useSetClassMemberCosmetics = () =>
  useClassCosmeticsStore((state) => state.setMemberCosmetics)

export const useUpsertClassMemberCosmetic = () =>
  useClassCosmeticsStore((state) => state.upsertMemberCosmetic)

export const useHydrateCosmeticsFromMembers = () =>
  useClassCosmeticsStore((state) => state.hydrateFromMembers)

export const useClearClassCosmetics = () =>
  useClassCosmeticsStore((state) => state.clearMemberCosmetics)
