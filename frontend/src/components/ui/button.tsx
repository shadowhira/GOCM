import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Default (Neutral Primary)
        default:
          "bg-primary-600 text-white shadow hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-400",

        // Red destructive
        destructive:
          "bg-error text-white shadow-sm hover:bg-error/90 active:bg-error/80 focus:ring-error/50",

        // Outline (neutral with hover highlight)
        outline:
          "border border-border bg-background text-foreground hover:bg-primary-50 hover:text-primary-700 focus:ring-primary-300",

        // Secondary (muted blue)
        secondary:
          "bg-secondary-600 text-white shadow-sm hover:bg-secondary-700 active:bg-secondary-800 focus:ring-secondary-300",

        // Ghost (transparent with contrast hover)
        ghost:
          "text-foreground hover:bg-muted hover:text-foreground/80 active:bg-muted/80 focus:ring-primary-300",

        // Link
        link:
          "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 focus:ring-primary-300",

        // 💙 Design system enhanced variants
        primary:
          "bg-primary-500 text-white shadow hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-300",
        accent:
          "bg-accent-500 text-accent-950 shadow hover:bg-accent-600 active:bg-accent-700 focus:ring-accent-300",
        success:
          "bg-success text-white shadow hover:bg-success/90 active:bg-success/80 focus:ring-success/50",
        warning:
          "bg-warning text-white shadow hover:bg-warning/90 active:bg-warning/80 focus:ring-warning/40",
        error:
          "bg-error text-white shadow hover:bg-error/90 active:bg-error/80 focus:ring-error/40",

        // Classroom-specific variants
        grade:
          "bg-grade-good text-white shadow hover:bg-grade-good/90 active:bg-grade-good/80 focus:ring-grade-good/40",
        assignment:
          "bg-secondary-500 text-white shadow hover:bg-secondary-600 active:bg-secondary-700 focus:ring-secondary-300",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        xl: "h-12 rounded-lg px-10 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
