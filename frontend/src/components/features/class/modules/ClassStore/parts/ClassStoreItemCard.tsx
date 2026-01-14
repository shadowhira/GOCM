'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { ClassShopItemResponse, CosmeticSlot } from '@/types/class'
import { ShopItemTier } from '@/types/shopItem'
import { cn, parseBackendDateTime } from '@/lib/utils'
import { useMemo, useState } from 'react'
import { cosmeticSlotLabelKeyMap } from '../utils/cosmetics'

/** Map tier enum to translation key */
const tierLabelKeyMap: Record<ShopItemTier, string> = {
  [ShopItemTier.Basic]: 'shop_item_tier_basic',
  [ShopItemTier.Advanced]: 'shop_item_tier_advanced',
  [ShopItemTier.Elite]: 'shop_item_tier_elite',
  [ShopItemTier.Legendary]: 'shop_item_tier_legendary',
}

/** Map tier enum to badge styling */
const tierStyleMap: Record<ShopItemTier, string> = {
  [ShopItemTier.Basic]: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
  [ShopItemTier.Advanced]: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30',
  [ShopItemTier.Elite]: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
  [ShopItemTier.Legendary]: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30',
}

const parsedExpirationDays = Number.parseInt(process.env.NEXT_PUBLIC_CLASS_STORE_EXPIRATION_DAYS ?? '', 10)
const REWARD_EXPIRATION_DAYS = Number.isNaN(parsedExpirationDays) || parsedExpirationDays <= 0 ? 30 : parsedExpirationDays
const DAY_IN_MS = 1000 * 60 * 60 * 24

interface ClassStoreItemCardProps {
  item: ClassShopItemResponse
  canManage: boolean
  canPurchase: boolean
  disablePurchase?: boolean
  onRemove: (classShopItemId: number) => void
  onPurchase: (shopItemId: number) => void
  isRemoving?: boolean
  isPurchasing?: boolean
  equipSlot?: CosmeticSlot | null
  onEquip?: (slot: CosmeticSlot, shopItemId: number) => void
  onUnequip?: (slot: CosmeticSlot) => void
  isEquipping?: boolean
}

export const ClassStoreItemCard = ({
  item,
  canManage,
  canPurchase,
  disablePurchase,
  onRemove,
  onPurchase,
  isRemoving,
  isPurchasing,
  equipSlot,
  onEquip,
  onUnequip,
  isEquipping,
}: ClassStoreItemCardProps) => {
  const t = useTranslations()
  const [removeOpen, setRemoveOpen] = useState(false)
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  const expiresAtDate = useMemo(() => parseBackendDateTime(item.expiresAt), [item.expiresAt])

  const baseDurationDays = useMemo(() => {
    return item.usageDurationDays > 0 ? item.usageDurationDays : REWARD_EXPIRATION_DAYS
  }, [item.usageDurationDays])



  const expirationLabel = useMemo(() => {
    if (!expiresAtDate) {
      return null
    }

    return expiresAtDate.toLocaleString('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }, [expiresAtDate])

  const daysRemaining = useMemo(() => {
    if (typeof item.remainingDays === 'number') {
      return Math.max(item.remainingDays, 0)
    }

    if (!expiresAtDate) {
      return null
    }

    const diffMs = expiresAtDate.getTime() - Date.now()
    return Math.max(Math.ceil(diffMs / DAY_IN_MS), 0)
  }, [item.remainingDays, expiresAtDate])

  const expirationBadgeText = useMemo(() => {
    if (!item.isPurchasedByCurrentUser || daysRemaining === null) {
      return null
    }

    return daysRemaining > 0
      ? t('class_store_expires_in_badge', { days: daysRemaining })
      : t('class_store_expired_badge')
  }, [daysRemaining, item.isPurchasedByCurrentUser, t])

  const expirationDetailText = useMemo(() => {
    if (!item.isPurchasedByCurrentUser || !expirationLabel) {
      return null
    }

    return daysRemaining !== null && daysRemaining <= 0
      ? t('class_store_expiration_expired_detail', { date: expirationLabel })
      : t('class_store_expiration_detail', { date: expirationLabel })
  }, [daysRemaining, expirationLabel, item.isPurchasedByCurrentUser, t])

  const usageDurationLabel = useMemo(() => {
    return t('class_store_usage_duration_meta', { days: baseDurationDays })
  }, [baseDurationDays, t])

  const purchaseButtonLabel = item.isPurchasedByCurrentUser
    ? t('class_store_purchase_again_button')
    : t('class_store_purchase_button')
  const triggerLabel = disablePurchase
    ? t('class_store_purchase_disabled_button')
    : isPurchasing
      ? t('class_store_purchase_processing')
      : purchaseButtonLabel

  const hasEquipSlot = equipSlot !== null && equipSlot !== undefined
  const slotLabel = hasEquipSlot ? t(cosmeticSlotLabelKeyMap[equipSlot]) : null
  const showEquipAction = Boolean(canPurchase && hasEquipSlot && item.isPurchasedByCurrentUser)
  const isCurrentlyEquipped = Boolean(item.isEquippedByCurrentUser && hasEquipSlot)
  const equipButtonLabel = isCurrentlyEquipped ? t('class_store_unequip_button') : t('class_store_equip_button')
  const equipProcessingLabel = isCurrentlyEquipped
    ? t('class_store_unequip_processing')
    : t('class_store_equip_processing')
  const isEquipDisabled = Boolean(
    isEquipping || (!isCurrentlyEquipped && (!item.canEquip || !hasEquipSlot || !onEquip))
  )
  const showEquipHint = Boolean(showEquipAction && !item.canEquip && !isCurrentlyEquipped)

  const handleRemove = () => {
    onRemove(item.id)
    setRemoveOpen(false)
  }

  const handlePurchase = () => {
    onPurchase(item.shopItemId)
    setPurchaseOpen(false)
  }

  const handleEquip = () => {
    if (!hasEquipSlot || equipSlot === null || equipSlot === undefined) {
      return
    }

    if (isCurrentlyEquipped) {
      onUnequip?.(equipSlot)
      return
    }

    onEquip?.(equipSlot, item.shopItemId)
  }

  const tierLabel = t(tierLabelKeyMap[item.tier])
  const tierStyle = tierStyleMap[item.tier]

  return (
    <Card
      className={cn(
        'flex h-full flex-col',
        item.isEquippedByCurrentUser && 'ring-2 ring-primary border-primary'
      )}
    >
      <CardHeader className="flex flex-row gap-3 pb-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          {item.iconUrl ? (
            <Image
              src={item.iconUrl}
              alt={item.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : null}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold text-foreground truncate">
              {item.name}
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                'shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border',
                tierStyle
              )}
            >
              {tierLabel}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground line-clamp-2">
            {item.description || t('class_store_description_fallback')}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        <div className="flex flex-col gap-2">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="warning" className="text-xs font-semibold">
                {t('class_store_cost_badge', { points: item.costInPoints })}
              </Badge>
              {slotLabel ? (
                <Badge variant="outline" className="text-xs font-medium uppercase tracking-wide">
                  {slotLabel}
                </Badge>
              ) : null}
            </div>
            {(item.isPurchasedByCurrentUser || item.isEquippedByCurrentUser) ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {item.isPurchasedByCurrentUser ? (
                  <Badge
                    variant={daysRemaining !== null && daysRemaining <= 0 ? 'warning' : 'success'}
                    className="text-xs font-medium uppercase tracking-wide"
                  >
                    {expirationBadgeText ?? t('class_store_redeemed_badge')}
                  </Badge>
                ) : null}
                {item.isEquippedByCurrentUser ? (
                  <Badge variant="secondary" className="text-xs font-medium uppercase tracking-wide">
                    {t('class_store_equipped_badge')}
                  </Badge>
                ) : null}
              </div>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground">
            {usageDurationLabel}
          </p>

          {canPurchase ? (
            <div className="text-xs text-muted-foreground">
              {item.isPurchasedByCurrentUser ? (
                <>
                  <p className="font-medium text-foreground">
                    {t('class_store_redeemed_times', { count: item.purchaseCountByCurrentUser })}
                  </p>
                  {expirationDetailText ? <p>{expirationDetailText}</p> : null}
                </>
              ) : (
                <p>{t('class_store_not_redeemed_hint')}</p>
              )}
            </div>
          ) : null}
        </div>

        <div className={cn('mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between')}>
          {canManage ? (
            <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto" disabled={isRemoving}>
                  {isRemoving ? t('class_store_remove_processing') : t('class_store_remove_button')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('class_store_remove_confirm_title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('class_store_remove_confirm_message', { name: item.name })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isRemoving}>{t('cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemove} disabled={isRemoving}>
                    {isRemoving ? t('class_store_remove_processing') : t('class_store_remove_button')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}

          {canPurchase ? (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <AlertDialog open={purchaseOpen} onOpenChange={setPurchaseOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={disablePurchase || isPurchasing}
                  >
                    {triggerLabel}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('class_store_purchase_confirm_title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('class_store_purchase_confirm_message', {
                        name: item.name,
                        points: item.costInPoints,
                      })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPurchasing}>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePurchase} disabled={disablePurchase || isPurchasing}>
                      {isPurchasing ? t('class_store_purchase_processing') : purchaseButtonLabel}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {showEquipAction ? (
                <div className="flex flex-1 flex-col gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={isEquipDisabled}
                    onClick={handleEquip}
                  >
                    {isEquipping ? equipProcessingLabel : equipButtonLabel}
                  </Button>
                  {showEquipHint ? (
                    <p className="text-xs text-muted-foreground">
                      {t('class_store_equip_unavailable_hint')}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
