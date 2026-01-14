import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ParentType } from '@/types/constants'

interface DocumentsFiltersProps {
  searchQuery: string
  parentTypeFilter: 'all' | ParentType
  onSearchChange: (query: string) => void
  onFilterChange: (filter: 'all' | ParentType) => void
}

export const DocumentsFilters = ({
  searchQuery,
  parentTypeFilter,
  onSearchChange,
  onFilterChange,
}: DocumentsFiltersProps) => {
  const t = useTranslations()

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('search_documents')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Tabs */}
      <Tabs
        value={parentTypeFilter.toString()}
        onValueChange={(value) => onFilterChange(value === 'all' ? 'all' : parseInt(value) as ParentType)}
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">{t('filter_all_documents')}</TabsTrigger>
          <TabsTrigger value={ParentType.ASSIGNMENT.toString()}>
            {t('filter_assignment_documents')}
          </TabsTrigger>
          <TabsTrigger value={ParentType.POST.toString()}>
            {t('filter_post_documents')}
          </TabsTrigger>
          <TabsTrigger value={ParentType.COMMENT.toString()}>
            {t('filter_comment_documents')}
          </TabsTrigger>
          <TabsTrigger value={ParentType.SUBMISSION.toString()}>
            {t('filter_submission_documents')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
