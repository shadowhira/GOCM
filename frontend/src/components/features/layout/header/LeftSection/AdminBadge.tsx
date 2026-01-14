"use client"

import { Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouterWithProgress } from '@/hooks/useRouterWithProgress'
import { useCurrentUser } from '@/store/auth/useAuthStore'
import { Role } from '@/types/auth'

export const AdminBadge = () => {
  const t = useTranslations()
  const router = useRouterWithProgress()
  const user = useCurrentUser()
  const isAdmin = user?.role === Role.Admin

  if (!isAdmin) return null

  const handleClick = () => {
    router.push('/admin')
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 hover:border-primary-300 transition-colors cursor-pointer flex-shrink-0"
      aria-label="Go to Admin Panel"
    >
      <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-600" />
      <span className="text-xs sm:text-sm font-medium text-primary-700 hidden md:inline">
        {t('admin_panel')}
      </span>
    </button>
  )
}
