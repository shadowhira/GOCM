'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  useCreateClass,
  useDeleteClass,
  useGetClassById,
  useGetClassList,
  useUpdateClass,
} from '@/queries/classQueries'
import { classApi } from '@/api/classApi'
import type { ClassResponse } from '@/types/class'
import { AdminClassesHeader } from './sections/header/AdminClassesHeader'
import { AdminClassesFilters } from './sections/filters/AdminClassesFilters'
import { AdminClassesSkeleton } from './sections/list/AdminClassesSkeleton'
import { AdminClassesEmptyState } from './sections/list/AdminClassesEmptyState'
import { AdminClassesTable } from './sections/list/AdminClassesTable'
import { AdminClassesPagination } from './sections/list/AdminClassesPagination'
import { getApiErrorMessage } from '@/lib/api-error'
import { ClassFormModal } from './ClassFormModal'
import { ClassDeleteDialog } from './ClassDeleteDialog'
import { ClassDetailsSheet } from './ClassDetailsSheet'
import { useAdminClassesFilters } from './hooks/useAdminClassesFilters'
import { useAdminClassesHash } from './hooks/useAdminClassesHash'
import { ADMIN_CLASSES_PAGINATION } from '@/config/pagination'
import type { CreateClassFormData, EditClassFormData } from '@/schemas/classSchema'
import { useQueryClient } from '@tanstack/react-query'
import { classKeys } from '@/queries/classQueries'

interface AdminClassesPageProps {
  initialPage?: number
  initialPageSize?: number
}

export const AdminClassesPage = ({
  initialPage = ADMIN_CLASSES_PAGINATION.DEFAULT_PAGE_NUMBER,
  initialPageSize = ADMIN_CLASSES_PAGINATION.DEFAULT_PAGE_SIZE,
}: AdminClassesPageProps) => {
  const t = useTranslations()
  const {
    params,
    updateParams,
    searchInput,
    setSearchInput,
    onlyMine,
    handleOnlyMineChange,
    resetFilters,
    pageNumber,
    pageSize,
  } = useAdminClassesFilters({ initialPage, initialPageSize })

  const { hashState, openCreate, openEdit, openDelete, openDetails, close } = useAdminClassesHash()
  const activeClassId = hashState.classId ?? 0

  const classesQuery = useGetClassList({
    pageNumber,
    pageSize,
    name: params.search?.trim() || undefined,
    onlyMine: onlyMine || undefined,
  })

  const { data, isLoading, isError, refetch, isFetching } = classesQuery

  const classes = useMemo(() => data?.items ?? [], [data?.items])

  const queryClient = useQueryClient()
  const createClassMutation = useCreateClass()
  const updateClassMutation = useUpdateClass()
  const deleteClassMutation = useDeleteClass()
  const [isUpdating, setIsUpdating] = useState(false)

  const { data: classDetail, isLoading: isClassDetailLoading } = useGetClassById(activeClassId)

  const selectedClass: ClassResponse | undefined = useMemo(() => {
    if (!activeClassId) {
      return undefined
    }
    return classes.find((item) => item.id === activeClassId) ?? classDetail
  }, [activeClassId, classes, classDetail])

  const handleCreateClass = (values: CreateClassFormData | EditClassFormData) => {
    createClassMutation.mutate({ name: values.name, description: values.description }, {
      onSuccess: () => {
        toast.success(t('class_created_success'))
        close()
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, t('create_class_failed'), t))
      },
    })
  }

  const handleUpdateClass = async (values: CreateClassFormData | EditClassFormData, coverFile?: File) => {
    if (!selectedClass) {
      return
    }

    const editValues = values as EditClassFormData
    setIsUpdating(true)

    try {
      // 1. Update basic class info + cover color
      await updateClassMutation.mutateAsync({
        id: selectedClass.id,
        data: {
          name: editValues.name,
          description: editValues.description,
          coverColor: editValues.coverColor,
        },
      })

      // 2. Upload cover image if provided
      if (coverFile) {
        await classApi.uploadCover(selectedClass.id, coverFile)
      }

      // 3. Update appearance settings if changed
      const appearanceChanged =
        editValues.showAvatarFrames !== selectedClass.appearanceSettings?.showAvatarFrames ||
        editValues.showChatFrames !== selectedClass.appearanceSettings?.showChatFrames ||
        editValues.showBadges !== selectedClass.appearanceSettings?.showBadges

      if (appearanceChanged) {
        await classApi.updateAppearanceSettings(selectedClass.id, {
          showAvatarFrames: editValues.showAvatarFrames ?? true,
          showChatFrames: editValues.showChatFrames ?? true,
          showBadges: editValues.showBadges ?? true,
        })
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: classKeys.detail(selectedClass.id) })
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })

      toast.success(t('saved_successfully'))
      close()
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('save_failed'), t))
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteClass = () => {
    if (!hashState.classId) {
      return
    }
    deleteClassMutation.mutate(hashState.classId, {
      onSuccess: () => {
        toast.success(t('class_deleted'))
        close()
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, t('delete_class_failed'), t))
      },
    })
  }

  const showEmptyState = !isLoading && !isError && classes.length === 0
  const emptyStateType: 'empty' | 'no-results' = params.search || onlyMine ? 'no-results' : 'empty'

  const paginationPageIndex = data?.pageIndex ?? pageNumber
  const paginationTotalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <AdminClassesHeader totalClasses={data?.totalItems} onCreate={openCreate} />

      <AdminClassesFilters
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onlyMine={onlyMine}
        onOnlyMineChange={handleOnlyMineChange}
        isBusy={isFetching}
        onResetFilters={resetFilters}
      />

      {isError && <AdminClassesEmptyState type="error" onRetry={refetch} />}

      {isLoading && <AdminClassesSkeleton />}

      {!isLoading && !isError && classes.length > 0 && (
        <AdminClassesTable classes={classes} onView={openDetails} onEdit={openEdit} onDelete={openDelete} />
      )}

      {showEmptyState && <AdminClassesEmptyState type={emptyStateType} />}

      {!isLoading && !isError && data && (
        <AdminClassesPagination
          currentPage={paginationPageIndex}
          totalPages={paginationTotalPages}
          totalItems={data.totalItems}
          pageSize={data.pageSize}
          hasPreviousPage={data.hasPreviousPage}
          hasNextPage={data.hasNextPage}
          onPageChange={(page) => updateParams({ page })}
          onPageSizeChange={(nextPageSize) => updateParams({ pageSize: nextPageSize, page: 1 })}
        />
      )}

      <ClassFormModal
        mode={hashState.mode === 'edit' ? 'edit' : 'create'}
        open={hashState.mode === 'create' || hashState.mode === 'edit'}
        onClose={close}
        onSubmit={hashState.mode === 'edit' ? handleUpdateClass : handleCreateClass}
        defaultValues={hashState.mode === 'edit' ? {
          name: selectedClass?.name,
          description: selectedClass?.description,
          coverColor: selectedClass?.coverColor,
          showAvatarFrames: selectedClass?.appearanceSettings?.showAvatarFrames,
          showChatFrames: selectedClass?.appearanceSettings?.showChatFrames,
          showBadges: selectedClass?.appearanceSettings?.showBadges,
        } : undefined}
        classData={hashState.mode === 'edit' ? selectedClass : undefined}
        isSubmitting={hashState.mode === 'edit' ? isUpdating : createClassMutation.isPending}
        isLoading={hashState.mode === 'edit' && isClassDetailLoading && !selectedClass}
      />

      <ClassDeleteDialog
        open={hashState.mode === 'delete'}
        classData={selectedClass}
        onCancel={close}
        onConfirm={handleDeleteClass}
        isDeleting={deleteClassMutation.isPending}
      />

      <ClassDetailsSheet
        open={hashState.mode === 'details'}
        onClose={close}
        classData={selectedClass}
        classId={activeClassId}
        isLoading={isClassDetailLoading && !selectedClass}
      />
    </div>
  )
}
