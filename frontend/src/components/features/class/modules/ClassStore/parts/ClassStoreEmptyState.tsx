'use client'

import { Button } from '@/components/ui/button'
import { PackageSearch } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClassStoreEmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const ClassStoreEmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: ClassStoreEmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center', className)}>
      <PackageSearch className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button type="button" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
