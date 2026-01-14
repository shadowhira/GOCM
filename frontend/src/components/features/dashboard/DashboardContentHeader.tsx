import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, UserPlus, Filter } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type RoleFilter = 'all' | 'teacher' | 'student'

interface DashboardContentHeaderProps {
  classCount: number
  onCreateClass: () => void
  onJoinClass: () => void
  roleFilter: RoleFilter
  onRoleFilterChange: (value: RoleFilter) => void
}

export const DashboardContentHeader = ({ 
  classCount, 
  onCreateClass, 
  onJoinClass,
  roleFilter,
  onRoleFilterChange,
}: DashboardContentHeaderProps) => {
  const t = useTranslations()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary-800 mb-2">
          {t('my_classes')}
        </h1>
        <p className="text-muted-foreground">
          {t('you_have_active_classes', { 
            count: classCount,
            type: t(classCount === 1 ? 'class' : 'classes')
          })}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Role Filter Dropdown */}
        <Select value={roleFilter} onValueChange={(value: RoleFilter) => onRoleFilterChange(value)}>
          <SelectTrigger className="w-full sm:w-[180px] gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <SelectValue placeholder={t('filter_by_role')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_classes')}</SelectItem>
            <SelectItem value="teacher">{t('as_teacher')}</SelectItem>
            <SelectItem value="student">{t('as_student')}</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onCreateClass} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('create_class')}
        </Button>
        <Button onClick={onJoinClass} variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          {t('join_class')}
        </Button>
      </div>
    </div>
  )
}