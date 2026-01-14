'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import type { ClassMemberCosmeticSlotsResponse } from '@/types/class'
import { useCosmeticContext } from './hooks'
import { fallbackColors, getInitials, readAccentColor, readBorderColor } from './utils'

const sizeClasses: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
  xs: 'h-7 w-7 text-[0.65rem]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-base',
}

export interface CosmeticAvatarProps {
  classId?: number
  classMemberId?: number | null
  cosmetics?: ClassMemberCosmeticSlotsResponse | null
  avatarUrl?: string | null
  displayName?: string | null
  size?: keyof typeof sizeClasses
  className?: string
  showFrameWhenHidden?: boolean
}

export const CosmeticAvatar = ({
  classId,
  classMemberId,
  cosmetics,
  avatarUrl,
  displayName,
  size = 'md',
  className,
  showFrameWhenHidden = false,
}: CosmeticAvatarProps) => {
  const context = useCosmeticContext({ classId, classMemberId, cosmeticsOverride: cosmetics })
  const frame = context.flags.showAvatarFrames || showFrameWhenHidden ? context.cosmetics?.avatarFrame ?? null : null
  const hasFrame = Boolean(frame)
  const accentColor = hasFrame ? readAccentColor(frame?.config) : undefined
  const borderColor = hasFrame
    ? readBorderColor(frame?.config, accentColor ?? fallbackColors.border)
    : undefined
  const initials = getInitials(displayName)

  return (
    <div
      className={cn('inline-flex shrink-0 rounded-full h-auto', className)}
      style={
        hasFrame
          ? {
              padding: '2px',
              backgroundImage: `linear-gradient(135deg, ${accentColor}, ${borderColor})`,
            }
          : undefined
      }
      aria-hidden={false}
    >
      <Avatar
        className={cn('border border-border bg-background shadow-sm', sizeClasses[size])}
        style={hasFrame ? { borderColor } : undefined}
      >
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName ?? 'user avatar'} />
        ) : (
          <AvatarFallback>{initials}</AvatarFallback>
        )}
      </Avatar>
    </div>
  )
}

export default CosmeticAvatar
