export type RoleFilter = 'all' | 'admin' | 'user'

export type UserModalMode = 'none' | 'create' | 'edit' | 'delete'

export interface HashState {
  mode: UserModalMode
  userId?: number
}
