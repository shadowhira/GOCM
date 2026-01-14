'use client'

import { forwardRef, type ReactNode, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface ClickableAvatarWrapperProps {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  className?: string
  disabled?: boolean
}

/**
 * A wrapper component that makes any avatar clickable
 * Provides keyboard accessibility and proper focus styles
 */
export const ClickableAvatarWrapper = forwardRef<
  HTMLButtonElement,
  ClickableAvatarWrapperProps
>(({ children, onClick, className, disabled = false }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full transition-all duration-200',
        // 'hover:ring-2 hover:ring-primary-500/50 hover:ring-offset-2 hover:ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'active:scale-95',
        'disabled:pointer-events-none disabled:opacity-50',
        'cursor-pointer',
        className
      )}
    >
      {children}
    </button>
  )
})

ClickableAvatarWrapper.displayName = 'ClickableAvatarWrapper'
