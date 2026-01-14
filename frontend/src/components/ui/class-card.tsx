import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardContent, CardFooter } from "./card"
import { Badge } from "./badge"
import { Button } from "./button"

const classCardVariants = cva(
  "transition-all duration-200 cursor-pointer",
  {
    variants: {
      status: {
        active: "hover:shadow-lg hover:-translate-y-1",
        archived: "opacity-75 hover:opacity-100",
        draft: "border-dashed",
      },
      size: {
        compact: "min-h-[200px]",
        default: "min-h-[240px]", 
        expanded: "min-h-[300px]",
      }
    },
    defaultVariants: {
      status: "active",
      size: "default",
    },
  }
)

export interface ClassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof classCardVariants> {
  title: string
  description?: string
  instructor?: string
  studentsCount?: number
  lastActivity?: string
  status?: "active" | "archived" | "draft"
  onEnter?: () => void
  onSettings?: () => void
}

const ClassCard = React.forwardRef<HTMLDivElement, ClassCardProps>(
  ({ 
    className, 
    title, 
    description, 
    instructor, 
    studentsCount, 
    lastActivity,
    status = "active",
    size,
    onEnter,
    onSettings,
    ...props 
  }, ref) => {
    return (
      <Card
        ref={ref}
        variant="class"
        hover="lift"
        className={cn(classCardVariants({ status, size }), className)}
        {...props}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-primary-800 line-clamp-2">
                {title}
              </h3>
              {instructor && (
                <p className="text-sm text-primary-600 font-medium">
                  {instructor}
                </p>
              )}
            </div>
            <Badge 
              variant={status === "active" ? "success" : status === "draft" ? "warning" : "inactive"}
              size="sm"
            >
              {status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          {description && (
            <p className="text-sm text-card-foreground/80 line-clamp-3 mb-4">
              {description}
            </p>
          )}
          
          <div className="space-y-2 text-xs text-card-foreground/70">
            {studentsCount !== undefined && (
              <div className="flex items-center gap-1">
                <span>👥</span>
                <span>{studentsCount} students</span>
              </div>
            )}
            {lastActivity && (
              <div className="flex items-center gap-1">
                <span>🕒</span>
                <span>Last activity: {lastActivity}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2 gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            className="flex-1"
            onClick={onEnter}
          >
            Enter Class
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSettings}
          >
            Settings
          </Button>
        </CardFooter>
      </Card>
    )
  }
)

ClassCard.displayName = "ClassCard"

export { ClassCard, classCardVariants }