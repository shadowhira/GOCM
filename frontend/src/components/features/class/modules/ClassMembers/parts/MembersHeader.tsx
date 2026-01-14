'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'

interface MembersHeaderProps {
  totalMembers: number
  onInvite?: () => void
}

export const MembersHeader = ({ totalMembers, onInvite }: MembersHeaderProps) => {
  const t = useTranslations()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {t('sidebar_members')}
        </h1>
        <p className="text-muted-foreground">
          {t('total_members', { count: totalMembers })}
        </p>
      </div>
      <Button onClick={onInvite}>
        <UserPlus className="mr-2 h-4 w-4" />
        {t('invite_members')}
      </Button>
    </div>
  )
}
