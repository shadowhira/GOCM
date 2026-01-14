'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { ClassMemberCosmeticSlotsResponse } from '@/types/class'
import { useCurrentUser } from '@/store/auth/useAuthStore'
import { CosmeticAvatar, CosmeticBadge, CosmeticChatBubble } from '@/components/features/cosmetics'

interface CosmeticPreviewProps {
  cosmetics?: ClassMemberCosmeticSlotsResponse | null
  className?: string
}

/**
 * Preview component showing how equipped cosmetics will look in context
 * Uses the actual cosmetic components for accurate preview
 */
export const CosmeticPreview = ({ cosmetics, className }: CosmeticPreviewProps) => {
  const t = useTranslations()
  const currentUser = useCurrentUser()
  
  const displayName = currentUser?.displayName || 'Username'
  const avatarUrl = currentUser?.avatarUrl

  const hasAnyCosmetic = Boolean(
    cosmetics?.avatarFrame || cosmetics?.chatFrame || cosmetics?.badge
  )

  return (
    <div className={cn('rounded-lg border bg-muted/30 p-4', className)}>
      <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
        {t('class_store_preview_title')}
      </p>
      
      <div className="flex items-start gap-3">
        {/* Avatar with Frame - using CosmeticAvatar */}
        <CosmeticAvatar
          cosmetics={cosmetics}
          avatarUrl={avatarUrl}
          displayName={displayName}
          size="lg"
          showFrameWhenHidden
          className="shrink-0"
        />

        {/* Chat Message Preview with Frame */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{displayName}</span>
            {/* Badge - using CosmeticBadge */}
            <CosmeticBadge
              cosmetics={cosmetics}
              size="sm"
              showWhenDisabled
            />
          </div>
          
          {/* Chat bubble with frame - using CosmeticChatBubble */}
          <CosmeticChatBubble
            cosmetics={cosmetics}
            className="max-w-xs mt-1"
          >
            {t('class_store_preview_message')}
          </CosmeticChatBubble>
        </div>
      </div>

      {!hasAnyCosmetic && (
        <p className="text-xs text-muted-foreground text-center mt-3">
          {t('class_store_preview_empty')}
        </p>
      )}
    </div>
  )
}
