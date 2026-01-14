import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardContent, CardFooter } from "./card"
import { Badge } from "./badge"
import { Button } from "./button"

const assignmentCardVariants = cva(
  "transition-all duration-200",
  {
    variants: {
      priority: {
        low: "border-l-4 border-l-green-400",
        medium: "border-l-4 border-l-yellow-400",
        high: "border-l-4 border-l-red-400",
        urgent: "border-l-4 border-l-red-600 bg-red-50/30",
      },
      status: {
        draft: "opacity-75",
        published: "",
        overdue: "bg-red-50/50",
        completed: "bg-green-50/30",
      }
    },
    defaultVariants: {
      priority: "medium",
      status: "published",
    },
  }
)

export interface AssignmentCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof assignmentCardVariants> {
  title: string
  description?: string
  dueDate?: string
  points?: number
  submissionsCount?: number
  totalStudents?: number
  priority?: "low" | "medium" | "high" | "urgent"
  status?: "draft" | "published" | "overdue" | "completed"
  onView?: () => void
  onEdit?: () => void
  onGrade?: () => void
}

const AssignmentCard = React.forwardRef<HTMLDivElement, AssignmentCardProps>(
  ({ 
    className, 
    title, 
    description, 
    dueDate,
    points,
    submissionsCount,
    totalStudents,
    priority = "medium",
    status = "published",
    onView,
    onEdit,
    onGrade,
    ...props 
  }, ref) => {
    const isOverdue = status === "overdue"
    const submissionRate = submissionsCount && totalStudents 
      ? Math.round((submissionsCount / totalStudents) * 100)
      : 0

    return (
      <Card
        ref={ref}
        variant="assignment"
        hover="lift"
        className={cn(assignmentCardVariants({ priority, status }), className)}
        {...props}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <h3 className="font-semibold text-lg text-secondary-700 line-clamp-2">
                {title}
              </h3>
              {dueDate && (
                <p className={cn(
                  "text-sm",
                  isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"
                )}>
                  Due: {dueDate}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1 items-end">
              <Badge 
                variant={
                  status === "completed" ? "success" :
                  status === "overdue" ? "error" :
                  status === "draft" ? "warning" : "active"
                }
                size="sm"
              >
                {status}
              </Badge>
              {points && (
                <span className="text-xs text-muted-foreground">
                  {points} pts
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {description}
            </p>
          )}
          
          {totalStudents && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submissions</span>
                <span className="font-medium">
                  {submissionsCount || 0}/{totalStudents} ({submissionRate}%)
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    submissionRate > 80 ? "bg-green-500" :
                    submissionRate > 50 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${submissionRate}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex-1"
            onClick={onView}
          >
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
          >
            Edit
          </Button>
          {submissionsCount && submissionsCount > 0 && (
            <Button 
              variant="accent" 
              size="sm"
              onClick={onGrade}
            >
              Grade
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }
)

AssignmentCard.displayName = "AssignmentCard"

export { AssignmentCard, assignmentCardVariants }