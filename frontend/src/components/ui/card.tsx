import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border bg-card",
        primary: "border-primary-300 bg-primary-50 text-primary-900",
        secondary: "border-secondary-300 bg-secondary-50 text-secondary-900", 
        accent: "border-accent-300 bg-accent-50 text-accent-900",
        success: "border-green-300 bg-green-50 text-green-900",
        warning: "border-yellow-300 bg-yellow-50 text-yellow-900",
        error: "border-red-300 bg-red-50 text-red-900",
        // Classroom-specific variants - Enhanced contrast
        assignment: "border-secondary-300 bg-secondary-50 hover:bg-secondary-100 text-secondary-900",
        class: "border-primary-300 bg-primary-50 hover:bg-primary-100 text-primary-900 shadow-md",
        grade: "border-green-300 bg-green-50 text-green-900",
        student: "border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-900",
      },
      elevation: {
        none: "shadow-none",
        sm: "shadow-sm",
        default: "shadow",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
      },
      padding: {
        none: "",
        sm: "[&>*]:p-4",
        default: "[&>*]:p-4", 
        lg: "[&>*]:p-8",
      },
      hover: {
        none: "",
        lift: "hover:shadow-lg hover:-translate-y-1",
        glow: "hover:shadow-lg hover:shadow-primary-200/50",
        scale: "hover:scale-105",
      }
    },
    defaultVariants: {
      variant: "default",
      elevation: "default",
      padding: "default",
      hover: "none",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, elevation, padding, hover, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, elevation, padding, hover, className }))}
      {...props}
    />
  ))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
