'use client'

import { useTranslations } from 'next-intl'
import { Card, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

interface MembersFiltersProps {
  searchQuery: string
  roleFilter: 'all' | 'teacher' | 'student'
  onSearchChange: (value: string) => void
  onRoleFilterChange: (value: 'all' | 'teacher' | 'student') => void
}

export const MembersFilters = ({
  searchQuery,
  roleFilter,
  onSearchChange,
  onRoleFilterChange
}: MembersFiltersProps) => {
  const t = useTranslations()

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('search_members')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t('filter_by_role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all_roles')}</SelectItem>
              <SelectItem value="teacher">{t('teachers')}</SelectItem>
              <SelectItem value="student">{t('students')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
    </Card>
  )
}
