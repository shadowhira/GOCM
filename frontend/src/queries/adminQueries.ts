import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/adminApi'
import { userApi } from '@/api/userApi'
import { shopItemApi } from '@/api/shopItemApi'
import type {
  CreateUserRequest,
  UpdateUserRequest,
  GetPaginatedUsersRequest,
} from '@/types/user'
import type {
  CreateShopItemRequest,
  UpdateShopItemRequest,
  GetPaginatedShopItemsRequest,
} from '@/types/shopItem'
import { shopItemKeys } from '@/queries/shopItemQueries'

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  overview: () => [...adminKeys.all, 'overview'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  usersList: (params: GetPaginatedUsersRequest) => [...adminKeys.users(), 'list', params] as const,
  usersDetail: (id: number) => [...adminKeys.users(), 'detail', id] as const,
  shopItems: () => [...adminKeys.all, 'shopItems'] as const,
  shopItemsList: (params: GetPaginatedShopItemsRequest) => [...adminKeys.shopItems(), 'list', params] as const,
  shopItemsDetail: (id: number) => [...adminKeys.shopItems(), 'detail', id] as const,
}

// Admin Overview
export const useGetAdminOverview = () => {
  return useQuery({
    queryKey: adminKeys.overview(),
    queryFn: () => adminApi.getOverview(),
  })
}

// Users Management
export const useGetUsersList = (params: GetPaginatedUsersRequest) => {
  return useQuery({
    queryKey: adminKeys.usersList(params),
    queryFn: () => userApi.getList(params),
  })
}

export const useGetUserById = (id: number) => {
  return useQuery({
    queryKey: adminKeys.usersDetail(id),
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateUserRequest) => userApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      queryClient.invalidateQueries({ queryKey: adminKeys.overview() })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateUserRequest) => userApi.update(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() })
      queryClient.invalidateQueries({ queryKey: adminKeys.overview() })
    },
  })
}

// ShopItems Management
export const useGetShopItemsList = (params: GetPaginatedShopItemsRequest) => {
  return useQuery({
    queryKey: adminKeys.shopItemsList(params),
    queryFn: () => shopItemApi.getList(params),
  })
}

export const useGetShopItemById = (id: number) => {
  return useQuery({
    queryKey: adminKeys.shopItemsDetail(id),
    queryFn: () => shopItemApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateShopItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateShopItemRequest) => shopItemApi.create(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.shopItems() })
      queryClient.invalidateQueries({ queryKey: adminKeys.overview() })
      queryClient.invalidateQueries({ queryKey: shopItemKeys.all() })
    },
  })
}

export const useUpdateShopItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateShopItemRequest }) =>
      shopItemApi.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.shopItems() })
      queryClient.invalidateQueries({ queryKey: shopItemKeys.all() })
    },
  })
}

export const useDeleteShopItem = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => shopItemApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.shopItems() })
      queryClient.invalidateQueries({ queryKey: adminKeys.overview() })
      queryClient.invalidateQueries({ queryKey: shopItemKeys.all() })
    },
  })
}

export const useUploadShopItemIcon = () => {
  return useMutation({
    mutationFn: (file: File) => shopItemApi.uploadIcon(file),
  })
}
