'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { CosmeticSlot, RoleInClass, type ClassShopItemResponse } from '@/types/class'
import { useCurrentUser } from '@/store/auth/useAuthStore'
import {
  useClassMemberCosmetics,
  useSetClassMemberCosmetics,
  useSetClassAppearanceSettings,
  useUpsertClassMemberCosmetic,
} from '@/store'
import {
  useGetClassById,
  useGetClassShopItems,
  useAddClassShopItems,
  useRemoveClassShopItem,
  usePurchaseClassShopItem,
  useGetCurrentClassMember,
  useGetClassCosmetics,
  useEquipClassCosmetic,
} from '@/queries/classQueries'
import { useGetAllShopItems } from '@/queries/shopItemQueries'
import { ClassStoreHeader } from './parts/ClassStoreHeader'
import { ClassStoreFilters, type ClassStoreSortOption } from './parts/ClassStoreFilters'
import { ClassStoreSkeleton } from './parts/ClassStoreSkeleton'
import { ClassStoreEmptyState } from './parts/ClassStoreEmptyState'
import { ClassStoreItemCard } from './parts/ClassStoreItemCard'
import { ClassStoreAddDialog } from './parts/ClassStoreAddDialog'
import { useClassStoreHash } from './hooks/useClassStoreHash'
import { getApiErrorMessage } from '@/lib/api-error'
import { ClassStoreEquippedSection } from './parts/ClassStoreEquippedSection'
import { cosmeticSlotLabelKeyMap, normalizeCosmeticSlot, resolveSlotFromVisualType } from './utils/cosmetics'

interface ClassStoreProps {
  classId: string
}

export const ClassStore = ({ classId }: ClassStoreProps) => {
  const classIdNum = Number.parseInt(classId, 10)
  const t = useTranslations()
  const currentUser = useCurrentUser()

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ClassStoreSortOption>('name')
  const [currentPoints, setCurrentPoints] = useState<number | null>(null)
  const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null)
  const [pendingPurchaseId, setPendingPurchaseId] = useState<number | null>(null)
  const [pendingEquipSlot, setPendingEquipSlot] = useState<CosmeticSlot | null>(null)
  const { isAddDialogOpen, openAddDialog, closeAddDialog, handleDialogToggle } = useClassStoreHash()

  const { data: classData } = useGetClassById(classIdNum)
  const {
    data: shopItems = [],
    isLoading: isShopItemsLoading,
    isError: isShopItemsError,
    refetch: refetchShopItems,
  } = useGetClassShopItems(classIdNum)

  const { data: currentMember } = useGetCurrentClassMember(classIdNum, currentUser?.id)

  useEffect(() => {
    if (typeof currentMember?.points === 'number') {
      setCurrentPoints(currentMember.points)
    }
  }, [currentMember?.points])

  const isOwner = classData?.createdByUserId === currentUser?.id
  const isTeacher = classData?.userRoleInClass === RoleInClass.TEACHER || isOwner
  const canManageStore = Boolean(isTeacher)
  // Both teachers and students can purchase items
  const canPurchaseItems = Boolean(currentMember)

  const {
    data: cosmeticsList,
    isLoading: isCosmeticsLoading,
  } = useGetClassCosmetics(classIdNum, { enabled: canPurchaseItems })

  const setClassMemberCosmetics = useSetClassMemberCosmetics()
  const setClassAppearanceSettings = useSetClassAppearanceSettings()
  const upsertClassMemberCosmetic = useUpsertClassMemberCosmetic()
  const currentCosmetics = useClassMemberCosmetics(classIdNum, currentMember?.id ?? null)

  useEffect(() => {
    if (classIdNum && classData?.appearanceSettings) {
      setClassAppearanceSettings(classIdNum, classData.appearanceSettings)
    }
  }, [classData?.appearanceSettings, classIdNum, setClassAppearanceSettings])

  useEffect(() => {
    if (classIdNum && cosmeticsList) {
      setClassMemberCosmetics(classIdNum, cosmeticsList)
    }
  }, [classIdNum, cosmeticsList, setClassMemberCosmetics])

  const {
    data: allShopItems = [],
    isLoading: isLoadingAllShopItems,
  } = useGetAllShopItems({ enabled: isAddDialogOpen && canManageStore })

  const { mutateAsync: addShopItemsMutate, isPending: isAddingItems } = useAddClassShopItems(classIdNum)
  const { mutate: removeShopItemMutate } = useRemoveClassShopItem(classIdNum)
  const { mutate: purchaseShopItemMutate } = usePurchaseClassShopItem(classIdNum)
  const { mutate: equipCosmeticMutate, isPending: isEquipPending } = useEquipClassCosmetic(classIdNum)

  const existingShopItemIds = useMemo(() => new Set(shopItems.map((item) => item.shopItemId)), [shopItems])

  const availableShopItems = useMemo(
    () => allShopItems.filter((item) => !existingShopItemIds.has(item.id)),
    [allShopItems, existingShopItemIds]
  )

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    let items: ClassShopItemResponse[] = shopItems

    if (keyword) {
      items = items.filter((item) =>
        [item.name, item.description].some((value) => value?.toLowerCase().includes(keyword))
      )
    }

    const sorted = [...items]
    switch (sort) {
      case 'costLowHigh':
        sorted.sort((a, b) => a.costInPoints - b.costInPoints)
        break
      case 'costHighLow':
        sorted.sort((a, b) => b.costInPoints - a.costInPoints)
        break
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name))
    }

    return sorted
  }, [shopItems, search, sort])

  const handleAddShopItems = async (shopItemIds: number[]) => {
    try {
      await addShopItemsMutate({ shopItemIds })
      toast.success(t('class_store_add_success'))
      closeAddDialog()
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('class_store_add_error'), t))
    }
  }

  const handleRemoveItem = (classShopItemId: number) => {
    setPendingRemoveId(classShopItemId)
    removeShopItemMutate(classShopItemId, {
      onSuccess: () => {
        toast.success(t('class_store_remove_success'))
      },
      onError: (error: unknown) => {
        toast.error(getApiErrorMessage(error, t('class_store_remove_error'), t))
      },
      onSettled: () => {
        setPendingRemoveId(null)
      },
    })
  }

  const handlePurchaseItem = (shopItemId: number) => {
    setPendingPurchaseId(shopItemId)
    purchaseShopItemMutate(shopItemId, {
      onSuccess: (response) => {
        toast.success(t('class_store_purchase_success'))
        setCurrentPoints(response.remainingPoints)
      },
      onError: (error: unknown) => {
        toast.error(getApiErrorMessage(error, t('class_store_purchase_error'), t))
      },
      onSettled: () => {
        setPendingPurchaseId(null)
      },
    })
  }

  const handleEquipCosmetic = (slot: CosmeticSlot, shopItemId: number) => {
    setPendingEquipSlot(slot)
    equipCosmeticMutate(
      { slot, shopItemId },
      {
        onSuccess: (response) => {
          upsertClassMemberCosmetic(classIdNum, response)
          toast.success(t('class_store_equip_success', { slot: t(cosmeticSlotLabelKeyMap[slot]) }))
        },
        onError: (error: unknown) => {
          toast.error(getApiErrorMessage(error, t('class_store_equip_error'), t))
        },
        onSettled: () => {
          setPendingEquipSlot(null)
        },
      }
    )
  }

  const handleUnequipCosmetic = (slot: CosmeticSlot) => {
    setPendingEquipSlot(slot)
    equipCosmeticMutate(
      { slot, shopItemId: null },
      {
        onSuccess: (response) => {
          upsertClassMemberCosmetic(classIdNum, response)
          toast.success(t('class_store_equip_success', { slot: t(cosmeticSlotLabelKeyMap[slot]) }))
        },
        onError: (error: unknown) => {
          toast.error(getApiErrorMessage(error, t('class_store_equip_error'), t))
        },
        onSettled: () => {
          setPendingEquipSlot(null)
        },
      }
    )
  }

  const handleUnequipAll = async () => {
    const slots: CosmeticSlot[] = []
    if (currentCosmetics?.avatarFrame) slots.push(CosmeticSlot.AvatarFrame)
    if (currentCosmetics?.chatFrame) slots.push(CosmeticSlot.ChatFrame)
    if (currentCosmetics?.badge) slots.push(CosmeticSlot.Badge)

    if (slots.length === 0) return

    // Unequip all slots sequentially
    for (const slot of slots) {
      try {
        await new Promise<void>((resolve, reject) => {
          equipCosmeticMutate(
            { slot, shopItemId: null },
            {
              onSuccess: (response) => {
                upsertClassMemberCosmetic(classIdNum, response)
                resolve()
              },
              onError: (error) => reject(error),
            }
          )
        })
      } catch (error) {
        toast.error(getApiErrorMessage(error, t('class_store_equip_error'), t))
        return
      }
    }
    toast.success(t('class_store_unequip_all_success'))
  }

  return (
    <div className="space-y-6">
      <ClassStoreHeader
        classDisplayName={classData?.name}
        currentPoints={currentPoints}
        canManageStore={canManageStore}
        canPurchaseItems={canPurchaseItems}
        onAddClick={openAddDialog}
        showAddButton={canManageStore}
        addButtonDisabled={isAddingItems}
      />

      {canPurchaseItems ? (
        <ClassStoreEquippedSection
          cosmetics={currentCosmetics}
          isLoading={isCosmeticsLoading}
          onUnequip={handleUnequipCosmetic}
          onUnequipAll={handleUnequipAll}
          pendingSlot={pendingEquipSlot}
          isProcessing={isEquipPending}
        />
      ) : null}

      <ClassStoreFilters
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
      />

      {isShopItemsLoading ? (
        <ClassStoreSkeleton />
      ) : isShopItemsError ? (
        <ClassStoreEmptyState
          title={t('class_store_error_title')}
          description={t('class_store_error_description')}
          actionLabel={t('try_again')}
          onAction={() => refetchShopItems()}
        />
      ) : filteredItems.length === 0 ? (
        search ? (
          <ClassStoreEmptyState
            title={t('class_store_no_results_title')}
            description={t('class_store_no_results_description')}
          />
        ) : shopItems.length === 0 ? (
          <ClassStoreEmptyState
            title={canManageStore ? t('class_store_empty_teacher_title') : t('class_store_empty_student_title')}
            description={canManageStore ? t('class_store_empty_teacher_description') : t('class_store_empty_student_description')}
            actionLabel={canManageStore ? t('class_store_empty_teacher_action') : undefined}
            onAction={canManageStore ? openAddDialog : undefined}
          />
        ) : (
          <ClassStoreEmptyState
            title={t('class_store_no_results_title')}
            description={t('class_store_no_results_description')}
          />
        )
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const isRemoving = pendingRemoveId === item.id
            const disablePurchase = typeof currentPoints === 'number' && currentPoints < item.costInPoints
            const isPurchasing = pendingPurchaseId === item.shopItemId
            const equipSlot =
              resolveSlotFromVisualType(item.visualType) ?? normalizeCosmeticSlot(item.equippedInSlot)
            const hasEquipSlot = equipSlot !== null && equipSlot !== undefined
            const isEquipping = Boolean(hasEquipSlot && pendingEquipSlot === equipSlot && isEquipPending)

            return (
              <ClassStoreItemCard
                key={item.id}
                item={item}
                canManage={canManageStore}
                canPurchase={canPurchaseItems}
                disablePurchase={disablePurchase}
                onRemove={handleRemoveItem}
                onPurchase={handlePurchaseItem}
                isRemoving={isRemoving}
                isPurchasing={isPurchasing}
                equipSlot={equipSlot}
                onEquip={handleEquipCosmetic}
                onUnequip={handleUnequipCosmetic}
                isEquipping={isEquipping}
              />
            )
          })}
        </div>
      )}

      {canManageStore ? (
        <ClassStoreAddDialog
          open={isAddDialogOpen}
          onOpenChange={handleDialogToggle}
          items={availableShopItems}
          isSubmitting={isAddingItems}
          isLoadingItems={isLoadingAllShopItems}
          onSubmit={handleAddShopItems}
        />
      ) : null}
    </div>
  )
}