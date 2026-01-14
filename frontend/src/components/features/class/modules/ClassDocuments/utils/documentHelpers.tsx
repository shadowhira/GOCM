import { FileText, File, FileImage, FileVideo, FileAudio } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { FileType, ParentType } from '@/types/constants'
import { cn } from '@/lib/utils'
import { parseBackendDateTime } from '@/lib/utils'

/**
 * Get icon component for a specific file type
 */
export const getFileIcon = (fileType: FileType, className?: string) => {
  const iconClass = cn('h-5 w-5', className)
  
  switch (fileType) {
    case FileType.IMAGE:
      return <FileImage className={cn(iconClass, 'text-success')} />
    case FileType.VIDEO:
      return <FileVideo className={cn(iconClass, 'text-secondary-600')} />
    case FileType.AUDIO:
      return <FileAudio className={cn(iconClass, 'text-accent-600')} />
    case FileType.PDF:
      return <FileText className={cn(iconClass, 'text-error')} />
    case FileType.WORD:
    case FileType.EXCEL:
    case FileType.POWERPOINT:
      return <FileText className={cn(iconClass, 'text-primary-600')} />
    default:
      return <File className={cn(iconClass, 'text-muted-foreground')} />
  }
}

/**
 * Get human-readable file type name
 */
export const getFileTypeName = (fileType: FileType): string => {
  const typeNames: Record<FileType, string> = {
    [FileType.PDF]: 'PDF',
    [FileType.WORD]: 'Word',
    [FileType.EXCEL]: 'Excel',
    [FileType.POWERPOINT]: 'PowerPoint',
    [FileType.IMAGE]: 'Image',
    [FileType.VIDEO]: 'Video',
    [FileType.AUDIO]: 'Audio',
    [FileType.TEXT]: 'Text',
    [FileType.ZIP]: 'ZIP',
    [FileType.OTHER]: 'Other',
  }
  return typeNames[fileType] || 'Unknown'
}

/**
 * Get badge component for parent type
 */
export const getParentTypeBadge = (parentType: ParentType, t: (key: string) => string, variant: 'secondary' | 'outline' = 'secondary') => {
  const badges: Record<ParentType, string> = {
    [ParentType.ASSIGNMENT]: t('parent_type_assignment'),
    [ParentType.POST]: t('parent_type_post'),
    [ParentType.COMMENT]: t('parent_type_comment'),
    [ParentType.SUBMISSION]: t('parent_type_submission'),
  }

  const label = badges[parentType]
  if (!label) return null

  return (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  )
}

/**
 */
export const formatDocumentDate = (date: string | Date, locale: string = 'en'): string => {
  let parsedDate: Date | null
  if (typeof date === 'string') {
    parsedDate = parseBackendDateTime(date)
  } else {
    parsedDate = date
  }
  if (!parsedDate) return ''
  return parsedDate.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}
