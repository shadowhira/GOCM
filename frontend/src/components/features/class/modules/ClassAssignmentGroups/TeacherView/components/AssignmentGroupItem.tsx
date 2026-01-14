import Link from "next/link";
import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  MoreHorizontal,
  ClipboardList,
  Pencil,
  Trash2,
} from "lucide-react";
import type { AssignmentResponse } from "@/types/assignment";
import { AssignmentStatus } from "@/types/constants";
import { cn, parseBackendDateTime } from "@/lib/utils";

interface AssignmentGroupItemProps {
  assignment: AssignmentResponse;
  href?: string;
  onEditAssignment: (assignmentId: number) => void;
  onDeleteAssignment: (assignment: AssignmentResponse) => void;
  t: (key: string) => string;
}

// Helper: convert enum → string
const getStatusString = (status?: AssignmentStatus) => {
  switch (status) {
    case AssignmentStatus.Expired:
      return "overdue";
    case AssignmentStatus.Assigned:
      return "assigned";
    default:
      return "assigned";
  }
};

export function AssignmentGroupItem({
  assignment,
  href,
  onEditAssignment,
  onDeleteAssignment,
  t,
}: AssignmentGroupItemProps) {
  const dueDate = assignment.deadline 
    ? parseBackendDateTime(String(assignment.deadline)) 
    : null;
  const dueDateStr = dueDate
    ? dueDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : t("no_due_date");

  const statusString = getStatusString(assignment.status);
  const isOverdue = statusString === "overdue";

  const cardClassName = cn(
    "group relative w-full transition-all duration-300 ease-out rounded-2xl border backdrop-blur-md cursor-pointer",
    // Card mặc định (Assigned)
    !isOverdue && [
      "border-border/60",
      "bg-gradient-to-br from-card/80 to-card/60",
      "shadow-sm hover:shadow-md",
      "hover:border-info/40",
      "hover:bg-gradient-to-br hover:from-info/5 hover:to-info/10",
    ],
    // Card khi Overdue
    isOverdue && [
      "border-error/30",
      "bg-gradient-to-br from-error/5 to-error/10",
      "shadow-sm shadow-error/5",
      "hover:shadow-md hover:shadow-error/10",
      "hover:border-error/50",
      "hover:bg-gradient-to-br hover:from-error/10 hover:to-error/15",
    ]
  );

  const cardContent = (
    <div
      className={cn(
        // Responsive layout
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 relative z-10"
      )}
    >
        {/* LEFT — Title & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* <Users className="h-4 w-4 text-primary flex-shrink-0" /> */}
            <h3 className="font-semibold text-lg sm:text-xl text-foreground/90 group-hover:text-primary transition-colors truncate">
              {assignment.title}
            </h3>
          </div>
          {/* 🔸 Mobile only: Deadline + Status */}
          <div className="flex sm:hidden items-center gap-3 mt-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="w-24">{dueDateStr}</span>
            <div
              className={cn(
                "ml-auto flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors",
                statusString === "assigned" &&
                  "bg-info/10 text-info border-info/30",
                statusString === "overdue" &&
                  "bg-error/10 text-error border-error/30"
              )}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              {t(statusString)}
            </div>
          </div>
        </div>

        {/* RIGHT — Desktop only: Deadline & Status */}
        <div className="hidden sm:flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground w-32">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="whitespace-nowrap">{dueDateStr}</span>
          </div>

          <div className="w-32 flex justify-end">
            <div
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors min-w-32",
                statusString === "assigned" &&
                  "bg-info/10 text-info dark:text-info border-info/30",
                statusString === "overdue" &&
                  "bg-error/10 text-error dark:text-error border-error/30"
              )}
            >
              <ClipboardList className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="whitespace-nowrap">{t(statusString)}</span>
            </div>
          </div>
        </div>

        {/* ACTIONS — Dropdown */}
        <div
          className="absolute top-4 right-4 sm:static sm:ml-4"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-all duration-200 hover:scale-110 hover:shadow-sm"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background/90 backdrop-blur-md border border-border/50 shadow-lg rounded-xl w-44 p-1"
            >
              <DropdownMenuItem
                onClick={() => onEditAssignment(assignment.id)}
                className="rounded-md hover:bg-accent/50 focus:bg-accent/50 flex items-center gap-2"
              >
                <Pencil className="h-4 w-4 text-info" /> {t("edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteAssignment(assignment)}
                className="rounded-md hover:bg-destructive/10 focus:bg-destructive/10 text-destructive focus:text-destructive flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> {t("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
  );

  // If href is provided, use Link for instant navigation with prefetch
  if (href) {
    return (
      <Link href={href} prefetch={true} className="block">
        <Card className={cardClassName}>
          {cardContent}
        </Card>
      </Link>
    );
  }

  // Fallback without navigation
  return (
    <Card className={cardClassName}>
      {cardContent}
    </Card>
  );
}
