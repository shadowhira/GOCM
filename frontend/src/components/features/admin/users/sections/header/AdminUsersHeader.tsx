'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserPlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AdminUsersHeaderProps {
  totalUsers?: number
  onCreateUser: () => void
}

export const AdminUsersHeader = ({ totalUsers = 0, onCreateUser }: AdminUsersHeaderProps) => {
  const t = useTranslations()

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              {t('admin_users')}
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              {t('users_management')}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('total_users')}: <span className="font-medium text-foreground">{totalUsers}</span>
            </p>
          </div>
        </div>
        <Button onClick={onCreateUser} variant="primary" className="w-full gap-2 md:w-auto">
          <UserPlus className="h-4 w-4" />
          {t('create_user')}
        </Button>
      </CardContent>
    </Card>
  )
}
