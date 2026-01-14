'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  useCreateShopItem,
  useDeleteShopItem,
  useGetShopItemById,
  useGetShopItemsList,
  useUpdateShopItem,
} from '@/queries/adminQueries'
import type { ShopItem } from '@/types/shopItem'
import { ShopItemTier, ShopItemVisualType } from '@/types/shopItem'
import { AdminShopItemsHeader } from './sections/header/AdminShopItemsHeader'
import { AdminShopItemsFilters } from './sections/filters/AdminShopItemsFilters'
import { AdminShopItemsSkeleton } from './sections/list/AdminShopItemsSkeleton'
import { AdminShopItemsTable } from './sections/list/AdminShopItemsTable'
import { AdminShopItemsEmptyState } from './sections/list/AdminShopItemsEmptyState'
import { AdminShopItemsPagination } from './sections/list/AdminShopItemsPagination'
import { ShopItemFormModal, type ShopItemFormValues } from './ShopItemFormModal'
import { ShopItemDeleteDialog } from './ShopItemDeleteDialog'
import { useAdminShopItemsFilters } from './hooks/useAdminShopItemsFilters'
import { useAdminShopItemsHash } from './hooks/useAdminShopItemsHash'
import { ADMIN_SHOP_ITEMS_PAGINATION } from '@/config/pagination'
import { getApiErrorMessage } from '@/lib/api-error'

interface AdminShopItemsPageProps {
  initialPage?: number
  initialPageSize?: number
}

export const AdminShopItemsPage = ({
  initialPage = ADMIN_SHOP_ITEMS_PAGINATION.DEFAULT_PAGE_NUMBER,
  initialPageSize = ADMIN_SHOP_ITEMS_PAGINATION.DEFAULT_PAGE_SIZE,
}: AdminShopItemsPageProps) => {
  const t = useTranslations()
  const {
    params,
    updateParams,
    searchInput,
    setSearchInput,
    visualType,
    setVisualType,
    resetFilters,
    pageNumber,
    pageSize,
  } = useAdminShopItemsFilters({
    initialPage,
    initialPageSize,
  })

  const { hashState, openCreate, openEdit, openDelete, close } = useAdminShopItemsHash()

  const shopItemsQuery = useGetShopItemsList({
    pageNumber,
    pageSize,
    keyword: params.search?.trim() || undefined,
  })

  const { data, isLoading, isError, isFetching } = shopItemsQuery
  
  // Client-side filtering by visual type
  const items = useMemo(() => {
    const allItems = data?.items ?? []
    if (visualType === undefined) {
      return allItems
    }
    return allItems.filter((item) => item.visualType === visualType)
  }, [data?.items, visualType])

  const createShopItemMutation = useCreateShopItem()
  const updateShopItemMutation = useUpdateShopItem()
  const deleteShopItemMutation = useDeleteShopItem()

  const activeShopItemId = hashState.shopItemId ?? 0
  const { data: shopItemDetail, isLoading: isShopItemDetailLoading } = useGetShopItemById(activeShopItemId)

  const selectedShopItem: ShopItem | undefined = useMemo(() => {
    if (!activeShopItemId) {
      return undefined
    }

    return items.find((item) => item.id === activeShopItemId) ?? shopItemDetail
  }, [activeShopItemId, items, shopItemDetail])

  const formDefaultValues = useMemo(() => {
    if (hashState.mode !== 'edit') {
      return undefined
    }

    return {
      name: selectedShopItem?.name ?? '',
      description: selectedShopItem?.description ?? '',
      costInPoints: selectedShopItem?.costInPoints ?? 0,
      usageDurationDays: selectedShopItem?.usageDurationDays ?? 30,
      iconUrl: selectedShopItem?.iconUrl ?? '',
      visualType: selectedShopItem?.visualType ?? ShopItemVisualType.NameBadge,
      tier: selectedShopItem?.tier ?? ShopItemTier.Basic,
      isDefault: selectedShopItem?.isDefault ?? false,
      configJson: selectedShopItem?.configJson ?? '',
    }
  }, [hashState.mode, selectedShopItem])

  const handleCreateShopItem = (values: ShopItemFormValues) => {
    createShopItemMutation.mutate(
      {
        name: values.name,
        description: values.description,
        costInPoints: values.costInPoints,
        usageDurationDays: values.usageDurationDays,
        iconUrl: values.iconUrl ?? '',
        visualType: values.visualType,
        tier: values.tier,
        isDefault: values.isDefault,
        configJson: values.configJson,
      },
      {
        onSuccess: () => {
          toast.success(t('shop_item_created_successfully'))
          close()
        },
        onError: (mutationError) => {
          toast.error(getApiErrorMessage(mutationError, t('something_went_wrong'), t))
        },
      }
    )
  }

  const handleUpdateShopItem = (values: ShopItemFormValues) => {
    if (!selectedShopItem) {
      return
    }

    updateShopItemMutation.mutate(
      {
        id: selectedShopItem.id,
        request: {
          id: selectedShopItem.id,
          name: values.name,
          description: values.description,
          costInPoints: values.costInPoints,
          usageDurationDays: values.usageDurationDays,
          iconUrl: values.iconUrl ?? '',
          visualType: values.visualType,
          tier: values.tier,
          isDefault: values.isDefault,
          configJson: values.configJson,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('shop_item_updated_successfully'))
          close()
        },
        onError: (mutationError) => {
          toast.error(getApiErrorMessage(mutationError, t('something_went_wrong'), t))
        },
      }
    )
  }

  const handleDeleteShopItem = () => {
    if (!hashState.shopItemId) {
      return
    }

    deleteShopItemMutation.mutate(hashState.shopItemId, {
      onSuccess: () => {
        toast.success(t('shop_item_deleted_successfully'))
        close()
      },
      onError: (mutationError) => {
        toast.error(getApiErrorMessage(mutationError, t('something_went_wrong'), t))
      },
    })
  }

  const showEmptyState = !isLoading && !isError && items.length === 0
  const emptyStateType: 'empty' | 'no-results' = params.search || visualType !== undefined ? 'no-results' : 'empty'

  const paginationPageIndex = data?.pageIndex ?? pageNumber
  const paginationTotalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <AdminShopItemsHeader totalItems={data?.totalItems} onCreateItem={openCreate} />

      <AdminShopItemsFilters
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        visualType={visualType}
        onVisualTypeChange={setVisualType}
        isBusy={isFetching}
        onResetFilters={resetFilters}
      />

      {isError && (
        <AdminShopItemsEmptyState type="error" onRetry={shopItemsQuery.refetch} />
      )}

      {isLoading && <AdminShopItemsSkeleton />}

      {!isLoading && !isError && items.length > 0 && (
        <AdminShopItemsTable items={items} onEdit={openEdit} onDelete={openDelete} />
      )}

      {showEmptyState && <AdminShopItemsEmptyState type={emptyStateType} />}

      {!isLoading && !isError && data && (
        <AdminShopItemsPagination
          currentPage={paginationPageIndex}
          totalPages={paginationTotalPages}
          hasPreviousPage={data.hasPreviousPage}
          hasNextPage={data.hasNextPage}
          onPageChange={(page) => updateParams({ page })}
        />
      )}

      <ShopItemFormModal
        mode={hashState.mode === 'edit' ? 'edit' : 'create'}
        open={hashState.mode === 'create' || hashState.mode === 'edit'}
        onClose={close}
        onSubmit={hashState.mode === 'edit' ? handleUpdateShopItem : handleCreateShopItem}
        defaultValues={formDefaultValues}
        isSubmitting={hashState.mode === 'create' ? createShopItemMutation.isPending : updateShopItemMutation.isPending}
        isLoading={hashState.mode === 'edit' && isShopItemDetailLoading && !selectedShopItem}
      />

      <ShopItemDeleteDialog
        open={hashState.mode === 'delete'}
        shopItem={selectedShopItem}
        onCancel={close}
        onConfirm={handleDeleteShopItem}
        isDeleting={deleteShopItemMutation.isPending}
      />
    </div>
  )
}
