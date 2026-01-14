'use client'

import type { HTMLAttributes, ReactNode } from 'react'
import type { ClassMemberCosmeticSlotsResponse } from '@/types/class'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useCosmeticContext } from './hooks'
import { fallbackColors, readAccentColor, readBorderColor, readThemeBackgroundColor, readThemeTextColor } from './utils'
import { useCurrentTheme } from '@/store'

export interface CosmeticChatBubbleProps extends HTMLAttributes<HTMLDivElement> {
  classId?: number
  classMemberId?: number | null
  cosmetics?: ClassMemberCosmeticSlotsResponse | null
  header?: ReactNode
  footer?: ReactNode
  align?: 'start' | 'end'
}

export const CosmeticChatBubble = ({
  classId,
  classMemberId,
  cosmetics,
  header,
  footer,
  align = 'start',
  className,
  children,
  ...rest
}: CosmeticChatBubbleProps) => {
  const currentTheme = useCurrentTheme()
  const isDark = currentTheme === 'dark'
  
  const context = useCosmeticContext({ classId, classMemberId, cosmeticsOverride: cosmetics })
  const chatFrame = context.flags.showChatFrames ? context.cosmetics?.chatFrame ?? null : null

  const accentColor = chatFrame ? readAccentColor(chatFrame.config) : undefined
  const borderColor = chatFrame
    ? readBorderColor(chatFrame.config, accentColor ?? fallbackColors.border)
    : undefined
  const backgroundColor = chatFrame ? readThemeBackgroundColor(chatFrame.config, isDark) : undefined
  const textColor = chatFrame ? readThemeTextColor(chatFrame.config, isDark) : undefined
  const isEndAligned = align === 'end'
  const wrapperAlignment = isEndAligned ? 'items-end text-right' : 'items-start text-left'

  return (
    <div className={cn('flex w-full flex-col gap-1', wrapperAlignment)}>
      {header ? (
        <div
          className={cn(
            'mb-1 text-xs font-semibold',
            !textColor && 'text-muted-foreground',
            isEndAligned ? 'text-right' : 'text-left'
          )}
          // style={textColor ? { color: textColor } : undefined}
        >
          {header}
        </div>
      ) : null}
      <div
        className={cn(
          'w-full rounded-2xl px-4 py-3 text-sm transition-colors',
          chatFrame ? 'border-2' : 'border bg-muted/50 border-border',
          // highlight && 'ring-2 ring-offset-2',
          className
        )}
        style={
          chatFrame
            ? {
                borderColor,
                backgroundColor,
                color: textColor,
              }
            : undefined
        }
        {...rest}
      >
        <div
          className={cn('text-sm', !textColor && 'text-foreground')}
          style={textColor ? { color: textColor } : undefined}
        >
          {children}
        </div>
        {footer ? (
          <div
            className={cn(
              'mt-2 text-xs',
              !textColor && 'text-muted-foreground',
              isEndAligned ? 'text-right' : 'text-left',
            )}
            style={textColor ? { color: textColor } : undefined}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default CosmeticChatBubble
