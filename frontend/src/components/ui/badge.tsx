import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        // Design system enhanced variants
        primary: "border-transparent bg-primary-500 text-white shadow hover:bg-primary-600",
        accent: "border-transparent bg-accent-500 text-accent-900 shadow hover:bg-accent-600",
        success: "border-transparent bg-success text-white shadow hover:bg-success/90",
        warning: "border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/90",
        error: "border-transparent bg-error text-white shadow hover:bg-error/90",
        info: "border-transparent bg-info text-white shadow hover:bg-info/90",
        // Grade-specific variants
        "grade-excellent": "border-transparent bg-grade-excellent text-white shadow",
        "grade-good": "border-transparent bg-grade-good text-white shadow",
        "grade-average": "border-transparent bg-grade-average text-white shadow",
        "grade-poor": "border-transparent bg-grade-poor text-white shadow",
        // Status variants for classroom
        active: "border-transparent bg-green-100 text-green-800 border-green-200",
        inactive: "border-transparent bg-muted text-muted-foreground border-border",
        pending: "border-transparent bg-yellow-100 text-yellow-800 border-yellow-200",
        completed: "border-transparent bg-blue-100 text-blue-800 border-blue-200",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
