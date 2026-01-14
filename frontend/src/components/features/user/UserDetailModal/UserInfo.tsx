'use client'

import { useTranslations } from 'next-intl'
import { Mail, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CosmeticBadge } from '@/components/features/cosmetics'
import { Role } from '@/types/auth'
import { RoleInClass } from '@/types/class'
import type { UserInfoProps } from './types'

export const UserInfo = ({ user, classContext }: UserInfoProps) => {
  const t = useTranslations()

  const getRoleBadgeVariant = (role?: Role) => {
    if (role === Role.Admin) return 'destructive'
    return 'secondary'
  }

  const getRoleLabel = (role?: Role) => {
    if (role === Role.Admin) return t('role_admin')
    return t('role_user')
  }

  return (
    <div className="flex flex-col items-center text-center space-y-2">
      {/* Display Name */}
      <h3 className="text-lg font-semibold text-foreground">
        {user.displayName}
      </h3>

      {/* Role Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* Class Role Badge (if in class context) */}
        {classContext && (
          <CosmeticBadge
            classId={classContext.classId}
            classMemberId={classContext.classMemberId}
            cosmetics={classContext.cosmetics}
            fallbackLabel={classContext.roleInClassLabel}
            size="md"
            className={
              classContext.roleInClass === RoleInClass.TEACHER
                ? 'uppercase tracking-wide'
                : undefined
            }
            showWhenDisabled
          />
        )}

        {/* System Role Badge (Admin/User) */}
        {user.role !== undefined && (
          <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
            <Shield className="h-3 w-3" />
            {getRoleLabel(user.role)}
          </Badge>
        )}
      </div>

      {/* Email */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Mail className="h-4 w-4" />
        <span>{user.email}</span>
      </div>
    </div>
  )
}
