'use client'

export const AdminClassesSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="h-5 w-48 rounded bg-muted" />
              <div className="h-4 w-80 rounded bg-muted" />
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-32 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
