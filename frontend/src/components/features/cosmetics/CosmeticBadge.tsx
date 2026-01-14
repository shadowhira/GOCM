'use client'

import type { ClassMemberCosmeticSlotsResponse } from '@/types/class'
import { cn } from '@/lib/utils'
import { useCosmeticContext } from './hooks'
import {
  fallbackColors,
  readAccentColor,
  readBorderColor,
  readThemeBackgroundColor,
  readThemeTextColor,
} from './utils'
import { useCurrentTheme } from '@/store'

export interface CosmeticBadgeProps {
  classId?: number
  classMemberId?: number | null
  cosmetics?: ClassMemberCosmeticSlotsResponse | null
  className?: string
  size?: 'sm' | 'md'
  fallbackLabel?: string
  showWhenDisabled?: boolean
}

const sizeClasses: Record<'sm' | 'md', string> = {
  sm: 'gap-1 px-2 py-0.5 text-[11px]',
  md: 'gap-1.5 px-3 py-1 text-xs',
}

export const CosmeticBadge = ({
  classId,
  classMemberId,
  cosmetics,
  className,
  size = 'sm',
  fallbackLabel,
  showWhenDisabled = false,
}: CosmeticBadgeProps) => {
  const currentTheme = useCurrentTheme()
  const isDark = currentTheme === 'dark'
  
  const context = useCosmeticContext({ classId, classMemberId, cosmeticsOverride: cosmetics })
  
  // Only show cosmetic badge if showBadges is enabled
  // showWhenDisabled only affects whether to show fallback label, not the cosmetic badge
  const showBadgesEnabled = context.flags.showBadges
  const badge = showBadgesEnabled ? context.cosmetics?.badge ?? null : null

  if (!badge) {
    // Show fallback label if showWhenDisabled is true, or if badges are enabled but user has no cosmetic badge
    if (!fallbackLabel || (!showWhenDisabled && !showBadgesEnabled)) {
      return null
    }

    return (
      <span className={cn('inline-flex items-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground', sizeClasses[size], className)}>
        {fallbackLabel}
      </span>
    )
  }

  const accentColor = readAccentColor(badge.config, fallbackColors.accent)
  const borderColor = readBorderColor(badge.config, accentColor)
  const backgroundColor = readThemeBackgroundColor(badge.config, isDark, 'hsl(var(--background))')
  const textColor = readThemeTextColor(badge.config, isDark)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold transition-colors duration-200',
        sizeClasses[size],
        className
      )}
      style={{
        borderColor,
        backgroundColor,
        color: textColor,
        boxShadow: `0 1px 3px ${accentColor}33`,
      }}
    >
      {/* {badge.iconUrl ? (
        <span className="relative flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-white/10">
          <Image src={badge.iconUrl} alt={badge.name} width={16} height={16} className="object-contain" />
        </span>
      ) : null} */}
      <span className="truncate max-w-32">{badge.name}</span>
    </span>
  )
}

export default CosmeticBadge
