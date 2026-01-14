'use client'

import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  useCreateUser,
  useDeleteUser,
  useGetUserById,
  useGetUsersList,
  useUpdateUser,
  adminKeys,
} from '@/queries/adminQueries'
import type { PaginatedUsersResponse, UserResponse } from '@/types/user'
import { Role } from '@/types/auth'
import { AdminUsersHeader } from './sections/header/AdminUsersHeader'
import { AdminUsersFilters } from './sections/filters/AdminUsersFilters'
import { AdminUsersSkeleton } from './sections/list/AdminUsersSkeleton'
import { AdminUsersTable } from './sections/list/AdminUsersTable'
import { AdminUsersEmptyState } from './sections/list/AdminUsersEmptyState'
import { AdminUsersPagination } from './sections/list/AdminUsersPagination'
import { UserDeleteDialog } from './UserDeleteDialog'
import { useAdminUsersFilters } from './hooks/useAdminUsersFilters'
import { useAdminUsersHash } from './hooks/useAdminUsersHash'
import { UserFormModal, UserFormValues } from './UserFormModal'
import { ADMIN_USERS_PAGINATION } from '@/config/pagination'
import { useCurrentUser, useUpdateUser as useUpdateAuthUser } from '@/store/auth'
import { userKeys } from '@/queries/userQueries'
import { getApiErrorMessage } from '@/lib/api-error'

interface AdminUsersPageProps {
  initialPage?: number
  initialPageSize?: number
}

export const AdminUsersPage = ({
  initialPage = ADMIN_USERS_PAGINATION.DEFAULT_PAGE_NUMBER,
  initialPageSize = ADMIN_USERS_PAGINATION.DEFAULT_PAGE_SIZE,
}: AdminUsersPageProps) => {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const currentUser = useCurrentUser()
  const updateAuthUser = useUpdateAuthUser()
  const {
    params,
    updateParams,
    searchInput,
    setSearchInput,
    roleFilter,
    handleRoleFilterChange,
    resetFilters,
    pageNumber,
    pageSize,
  } = useAdminUsersFilters({
    initialPage,
    initialPageSize,
  })

  const { hashState, openCreate, openEdit, openDelete, close } = useAdminUsersHash()

  const usersQuery = useGetUsersList({
    pageNumber,
    pageSize,
    displayName: params.search?.trim() || undefined,
  })

  const { data, isLoading, isError, isFetching } = usersQuery
  const users = useMemo(() => data?.items ?? [], [data?.items])

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'all') {
      return users
    }

    const roleValue = roleFilter === 'admin' ? Role.Admin : Role.User
    return users.filter((user) => user.role === roleValue)
  }, [users, roleFilter])

  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const activeUserId = hashState.userId ?? 0
  const { data: userDetail, isLoading: isUserDetailLoading } = useGetUserById(activeUserId)

  const selectedUser: UserResponse | undefined = useMemo(() => {
    if (!activeUserId) {
      return undefined
    }

    return users.find((user) => user.id === activeUserId) ?? userDetail
  }, [activeUserId, users, userDetail])

  const handleCreateUser = (values: UserFormValues) => {
    createUserMutation.mutate(
      {
        avatarUrl: values.avatarUrl ?? '',
        displayName: values.displayName,
        email: values.email,
        password: values.password ?? '',
        role: values.role === 'admin' ? Role.Admin : Role.User,
      },
      {
        onSuccess: () => {
          toast.success(t('user_created_successfully'))
          close()
        },
        onError: (mutationError) => {
          toast.error(getApiErrorMessage(mutationError, t('something_went_wrong'), t))
        },
      }
    )
  }

  const handleUpdateUser = (values: UserFormValues) => {
    if (!selectedUser) {
      return
    }

    const payload = {
      id: selectedUser.id,
      avatarUrl: values.avatarUrl ?? '',
      displayName: values.displayName,
      email: values.email,
      role: values.role === 'admin' ? Role.Admin : Role.User,
      password: values.password,
    }

    if (!payload.password) {
      delete (payload as { password?: string }).password
    }

    updateUserMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t('user_updated_successfully'))
        if (currentUser?.id === selectedUser.id) {
          updateAuthUser({
            displayName: payload.displayName,
            email: payload.email,
            avatarUrl: payload.avatarUrl?.trim() || selectedUser.avatarUrl,
            role: payload.role,
          })
          queryClient.invalidateQueries({ queryKey: userKeys.me() })
        }
        close()
      },
      onError: (mutationError) => {
        toast.error(getApiErrorMessage(mutationError, t('something_went_wrong'), t))
      },
    })
  }

  const handleDeleteUser = () => {
    if (!hashState.userId) {
      return
    }

    deleteUserMutation.mutate(hashState.userId, {
      onSuccess: () => {
        toast.success(t('user_deleted_successfully'))
        close()
      },
      onError: (mutationError) => {
        toast.error(getApiErrorMessage(mutationError, t('something_went_wrong'), t))
      },
    })
  }

  const isUsersListQueryKey = (queryKey: unknown): boolean => {
    if (!Array.isArray(queryKey)) return false
    const [scope, entity, segment] = queryKey
    const [adminScope, adminEntity] = adminKeys.users()
    return scope === adminScope && entity === adminEntity && segment === 'list'
  }

  // Keep invalidation limited to list queries so we don't force user detail endpoints to refetch.
  const invalidateUserLists = () => {
    queryClient.invalidateQueries({
      predicate: (query) => isUsersListQueryKey(query.queryKey),
    })
  }

  // Update cached tables immediately, avoiding a round-trip just to refresh avatar URLs.
  const syncUserInLists = (userId: number, avatarUrl: string) => {
    queryClient.setQueriesData<PaginatedUsersResponse | undefined>(
      {
        predicate: (query) => isUsersListQueryKey(query.queryKey),
      },
      (current) => {
        if (!current) return current
        return {
          ...current,
          items: current.items.map((item) =>
            item.id === userId ? { ...item, avatarUrl } : item
          ),
        }
      }
    )
  }

  const handleAvatarUploaded = (avatarUrl: string, targetUserId?: number) => {
    if (targetUserId) {
      syncUserInLists(targetUserId, avatarUrl)
      queryClient.setQueryData(adminKeys.usersDetail(targetUserId), (existing: UserResponse | undefined) =>
        existing ? { ...existing, avatarUrl } : existing
      )
      if (currentUser?.id === targetUserId) {
        updateAuthUser({ avatarUrl })
        queryClient.invalidateQueries({ queryKey: userKeys.me() })
      }
    }
    invalidateUserLists()
  }

  const showEmptyState = !isLoading && !isError && filteredUsers.length === 0
  const emptyStateType: 'empty' | 'no-results' = (params.search || roleFilter !== 'all') ? 'no-results' : 'empty'

  const paginationPageIndex = data?.pageIndex ?? pageNumber
  const paginationTotalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <AdminUsersHeader totalUsers={data?.totalItems} onCreateUser={openCreate} />

      <AdminUsersFilters
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleFilterChange}
        isBusy={isFetching}
        onResetFilters={resetFilters}
      />

      {isError && (
        <AdminUsersEmptyState type="error" onRetry={usersQuery.refetch} />
      )}

      {isLoading && <AdminUsersSkeleton />}

      {!isLoading && !isError && filteredUsers.length > 0 && (
        <AdminUsersTable users={filteredUsers} onEdit={openEdit} onDelete={openDelete} />
      )}

      {showEmptyState && <AdminUsersEmptyState type={emptyStateType} />}

      {!isLoading && !isError && data && (
        <AdminUsersPagination
          currentPage={paginationPageIndex}
          totalPages={paginationTotalPages}
          hasPreviousPage={data.hasPreviousPage}
          hasNextPage={data.hasNextPage}
          onPageChange={(page) => updateParams({ page })}
        />
      )}

      <UserFormModal
        mode={hashState.mode === 'edit' ? 'edit' : 'create'}
        open={hashState.mode === 'create' || hashState.mode === 'edit'}
        onClose={close}
        onSubmit={hashState.mode === 'edit' ? handleUpdateUser : handleCreateUser}
        onAvatarUploaded={handleAvatarUploaded}
        defaultValues={hashState.mode === 'edit' ? {
          displayName: selectedUser?.displayName,
          email: selectedUser?.email,
          avatarUrl: selectedUser?.avatarUrl,
          role: selectedUser?.role === Role.Admin ? 'admin' : 'user',
        } : {
          role: 'user',
        }}
        isSubmitting={hashState.mode === 'create' ? createUserMutation.isPending : updateUserMutation.isPending}
        isLoading={hashState.mode === 'edit' && isUserDetailLoading && !selectedUser}
        userId={hashState.mode === 'edit' ? selectedUser?.id : undefined}
      />

      <UserDeleteDialog
        open={hashState.mode === 'delete'}
        user={selectedUser}
        onCancel={close}
        onConfirm={handleDeleteUser}
        isDeleting={deleteUserMutation.isPending}
      />
    </div>
  )
}
