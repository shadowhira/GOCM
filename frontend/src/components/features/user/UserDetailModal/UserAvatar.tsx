'use client'

import { CosmeticAvatar } from '@/components/features/cosmetics'
import type { UserAvatarProps } from './types'

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
} as const

export const UserAvatar = ({
  user,
  classContext,
  size = 'xl',
  showFrame = true,
}: UserAvatarProps) => {
  return (
    <CosmeticAvatar
      classId={classContext?.classId}
      classMemberId={classContext?.classMemberId}
      cosmetics={classContext?.cosmetics}
      avatarUrl={user.avatarUrl}
      displayName={user.displayName}
      size={sizeMap[size]}
      showFrameWhenHidden={showFrame}
    />
  )
}
