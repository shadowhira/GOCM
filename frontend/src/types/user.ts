import type { Role } from './auth'

export interface UserResponse {
  id: number
  avatarUrl: string
  displayName: string
  email: string
  role: Role
}

export interface CreateUserRequest {
  avatarUrl: string
  displayName: string
  email: string
  password: string
  role: Role
}

export interface UpdateUserRequest {
  id: number
  avatarUrl: string
  displayName: string
  email: string
  password?: string
  role: Role
}

export interface GetPaginatedUsersRequest {
  pageNumber?: number
  pageSize?: number
  displayName?: string
  role?: Role
}

export interface PaginatedUsersResponse {
  items: UserResponse[]
  totalItems: number
  pageIndex: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface UpdateUserProfileRequest {
  displayName?: string
  email?: string
}

export interface UploadAvatarResponse {
  avatarUrl: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}
