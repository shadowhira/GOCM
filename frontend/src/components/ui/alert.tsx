import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        // Design system enhanced variants
        success: "border-success/50 bg-green-50 text-green-800 [&>svg]:text-success",
        warning: "border-warning/50 bg-yellow-50 text-yellow-800 [&>svg]:text-warning",
        error: "border-error/50 bg-red-50 text-red-800 [&>svg]:text-error",
        info: "border-info/50 bg-blue-50 text-blue-800 [&>svg]:text-info",
        // Classroom-specific variants
        assignment: "border-secondary-300/50 bg-secondary-50 text-secondary-800 [&>svg]:text-secondary-600",
        grade: "border-green-300/50 bg-green-50 text-green-800 [&>svg]:text-green-600",
        announcement: "border-accent-300/50 bg-accent-50 text-accent-900 [&>svg]:text-accent-600",
      },
      layout: {
        default: "",
        compact: "px-3 py-2 text-xs",
        spacious: "px-6 py-4 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      layout: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, layout, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant, layout }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
