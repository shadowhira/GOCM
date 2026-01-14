'use client'

import { useTranslations } from 'next-intl'
import { Calendar, Star, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { RoleInClass } from '@/types/class'
import type { UserClassInfoProps } from './types'

export const UserClassInfo = ({ classContext }: UserClassInfoProps) => {
  const t = useTranslations()

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'Z').toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getRoleIcon = () => {
    if (classContext.roleInClass === RoleInClass.TEACHER) {
      return <Users className="h-4 w-4 text-primary-500" />
    }
    return <Users className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <Card className="w-full bg-muted/30">
      <CardContent className="p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('class_information')}
        </h4>

        <div className="grid grid-cols-1 gap-3">
          {/* Role in Class */}
          <div className="flex items-center gap-3">
            {getRoleIcon()}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('nickname')}</p>
              <p className="text-sm font-medium text-foreground truncate">
                {classContext.roleInClassLabel}
              </p>
            </div>
          </div>

          {/* Enroll Date */}
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('enrolled_date')}</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(classContext.enrollDate)}
              </p>
            </div>
          </div>

          {/* Points */}
          <div className="flex items-center gap-3">
            <Star className="h-4 w-4 text-accent-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t('points')}</p>
              <p className="text-sm font-medium text-foreground">
                {classContext.points.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
