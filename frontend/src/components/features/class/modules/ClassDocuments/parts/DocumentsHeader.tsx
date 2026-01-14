import { useTranslations } from 'next-intl'
import { Upload, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type ViewMode = 'grid' | 'list'
export type SortOption = 'name' | 'date' | 'type'

interface DocumentsHeaderProps {
  canUpload: boolean
  viewMode: ViewMode
  sortBy: SortOption
  onUpload: () => void
  onViewModeChange: (mode: ViewMode) => void
  onSortChange: (sort: SortOption) => void
}

export const DocumentsHeader = ({ 
  canUpload, 
  viewMode,
  sortBy,
  onUpload,
  onViewModeChange,
  onSortChange,
}: DocumentsHeaderProps) => {
  const t = useTranslations()

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t('documents_title')}
          </h1>
          {/* <p className="text-muted-foreground mt-2">{t('documents_description')}</p> */}
        </div>
        {canUpload && (
          <Button onClick={onUpload} className="flex-shrink-0">
            <Upload className="mr-2 h-4 w-4" />
            {t('upload_new_document')}
          </Button>
        )}
      </div>

      {/* Toolbar: Sort + View Toggle */}
      <div className="flex items-center justify-between gap-4">
        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('sort_by')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{t('sort_by_name')}</SelectItem>
            <SelectItem value="date">{t('sort_by_date')}</SelectItem>
            <SelectItem value="type">{t('sort_by_type')}</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0',
              viewMode === 'grid' && 'bg-muted'
            )}
            onClick={() => onViewModeChange('grid')}
            title={t('view_mode_grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0',
              viewMode === 'list' && 'bg-muted'
            )}
            onClick={() => onViewModeChange('list')}
            title={t('view_mode_list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
