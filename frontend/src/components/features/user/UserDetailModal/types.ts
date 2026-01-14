import type { Role } from '@/types/auth'
import type { ClassMemberCosmeticSlotsResponse, RoleInClass } from '@/types/class'

/**
 * Basic user information
 */
export interface UserBasicInfo {
  id: number
  displayName: string
  email: string
  avatarUrl?: string | null
  role?: Role
}

/**
 * Class-specific context for the user
 * Only available when viewing user within a class context
 */
export interface UserClassContext {
  classId: number
  classMemberId: number
  roleInClass: RoleInClass
  roleInClassLabel: string
  points: number
  enrollDate: string
  cosmetics?: ClassMemberCosmeticSlotsResponse | null
}

/**
 * Props for the UserDetailModal component
 */
export interface UserDetailModalProps {
  /** Basic user information */
  user: UserBasicInfo
  /** Class context - optional, only when viewing user in a class */
  classContext?: UserClassContext | null
  /** Whether the modal is open */
  open: boolean
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void
  /** Optional custom trigger element */
  trigger?: React.ReactNode
}

/**
 * Props for UserDetailContent component
 */
export interface UserDetailContentProps {
  user: UserBasicInfo
  classContext?: UserClassContext | null
}

/**
 * Props for UserAvatar component
 */
export interface UserAvatarProps {
  user: UserBasicInfo
  classContext?: UserClassContext | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showFrame?: boolean
}

/**
 * Props for UserInfo component
 */
export interface UserInfoProps {
  user: UserBasicInfo
  classContext?: UserClassContext | null
}

/**
 * Props for UserClassInfo component
 */
export interface UserClassInfoProps {
  classContext: UserClassContext
}
