'use client'

import { cn } from '@/lib/utils'

interface ClassStoreSkeletonProps {
  className?: string
}

export const ClassStoreSkeleton = ({ className }: ClassStoreSkeletonProps) => {
  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 xl:grid-cols-3', className)}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-lg bg-muted animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
            <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
