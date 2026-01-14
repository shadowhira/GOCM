import { ASSIGNMENT_PAGINATION } from "@/config/pagination";
import { cn } from "@/lib/utils";

export const AssignmentListSkeleton = () => {
  return (
    <ul className="space-y-3">
      {Array.from({ length: ASSIGNMENT_PAGINATION.DEFAULT_PAGE_SIZE }).map(
        (_, i) => (
          <li key={i}>
            <div
              className={cn(
                "animate-pulse w-full rounded-2xl border border-border/60 bg-gradient-to-br from-background/60 to-background/80 backdrop-blur-md",
                "p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm"
              )}
            >
              {/* LEFT — Title + Description */}
              <div className="flex-1 space-y-3">
                <div className="h-4 w-3/4 bg-muted/60 rounded-lg" />
                <div className="h-3 w-5/6 bg-muted/50 rounded-lg" />
              </div>

              {/* RIGHT — Date + Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
                <div className="h-4 w-24 bg-muted/50 rounded-lg" />
                <div className="h-6 w-20 bg-muted/50 rounded-full" />
              </div>
            </div>
          </li>
        )
      )}
    </ul>
  );
};
