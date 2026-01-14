import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CosmeticSlot, type ClassMemberCosmeticSlotsResponse } from '@/types/class'
import { parseBackendDateTime } from '@/lib/utils'
import { cosmeticSlotDescriptionKeyMap, cosmeticSlotLabelKeyMap } from '../utils/cosmetics'
import { CosmeticPreview } from './CosmeticPreview'

interface ClassStoreEquippedSectionProps {
  cosmetics?: ClassMemberCosmeticSlotsResponse | null
  isLoading?: boolean
  onUnequip: (slot: CosmeticSlot) => void
  onUnequipAll?: () => void
  pendingSlot?: CosmeticSlot | null
  isProcessing?: boolean
}

const slotOrder: CosmeticSlot[] = [CosmeticSlot.AvatarFrame, CosmeticSlot.ChatFrame, CosmeticSlot.Badge]

export const ClassStoreEquippedSection = ({
  cosmetics,
  isLoading,
  onUnequip,
  onUnequipAll,
  pendingSlot,
  isProcessing,
}: ClassStoreEquippedSectionProps) => {
  const t = useTranslations()

  // Check if any cosmetic is equipped
  const hasAnyEquipped = Boolean(
    cosmetics?.avatarFrame || cosmetics?.chatFrame || cosmetics?.badge
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {slotOrder.map((slot) => (
            <Card key={slot}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-2 h-4 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-9 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Unequip All button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold text-foreground">{t('class_store_equipped_section_title')}</p>
          <p className="text-sm text-muted-foreground">{t('class_store_equipped_section_description')}</p>
        </div>
        {hasAnyEquipped && onUnequipAll && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onUnequipAll}
            disabled={isProcessing}
          >
            {t('class_store_unequip_all')}
          </Button>
        )}
      </div>

      {/* Preview Section */}
      <CosmeticPreview cosmetics={cosmetics} />

      {/* Equipped Slots Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {slotOrder.map((slot) => {
          const slotKey = cosmeticSlotLabelKeyMap[slot]
          const slotDescKey = cosmeticSlotDescriptionKeyMap[slot]
          const slotLabel = slotKey ? t(slotKey) : ''
          const slotDescription = slotDescKey ? t(slotDescKey) : ''
          const equippedItem = (() => {
            if (slot === CosmeticSlot.AvatarFrame) {
              return cosmetics?.avatarFrame
            }
            if (slot === CosmeticSlot.ChatFrame) {
              return cosmetics?.chatFrame
            }
            return cosmetics?.badge
          })()
          const expiresAt = equippedItem?.expiresAt ? parseBackendDateTime(equippedItem.expiresAt) : null
          const expiresLabel = expiresAt
            ? expiresAt.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
            : null
          const isExpired = typeof equippedItem?.remainingDays === 'number' && equippedItem.remainingDays <= 0
          const isButtonLoading = Boolean(isProcessing && pendingSlot === slot)

          return (
            <Card key={slot}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base font-semibold text-foreground">{slotLabel}</CardTitle>
                <p className="text-sm text-muted-foreground">{slotDescription}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {equippedItem ? (
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-muted">
                      {equippedItem.iconUrl ? (
                        <Image
                          src={equippedItem.iconUrl}
                          alt={equippedItem.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{equippedItem.name}</p>
                      {expiresLabel ? (
                        <p className="text-xs text-muted-foreground">
                          {isExpired
                            ? t('class_store_slot_expired_label', { date: expiresLabel })
                            : t('class_store_slot_expires_label', { date: expiresLabel })}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground">{t('class_store_slot_empty_state')}</p>
                    <p className="text-xs text-muted-foreground">{t('class_store_slot_empty_hint')}</p>
                  </div>
                )}

                {equippedItem ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isButtonLoading}
                    onClick={() => onUnequip(slot)}
                  >
                    {isButtonLoading ? t('class_store_slot_unequip_processing') : t('class_store_slot_unequip_button')}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
