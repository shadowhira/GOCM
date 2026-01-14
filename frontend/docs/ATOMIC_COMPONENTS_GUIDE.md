# Atomic Components Development Guide

## Overview
Small, reusable components like AvatarGroup, AvatarButton, SideBarItem.

## Core Principles

### 1. Design Tokens (REQUIRED)
- **MUST** use tokens from `frontend/src/lib/design-tokens.ts`
- Colors: `primary-500`, `neutral-100`, `success`, `grade-excellent`
- Spacing: `spacing.4`, `spacing.8`, `spacing.12`
- Typography: `fontSize.sm`, `fontWeight.medium`

### 2. Variant Strategy (FLEXIBLE)
- **Simple components**: No variants needed (e.g., Logo, Divider)
- **Moderate components**: 2-3 variants (e.g., StatusBadge, Avatar)
- **Complex components**: Multiple variants like Button (variant + size + state)
- **Rule**: Add variants based on actual usage needs, not speculation

### 3. Structure Requirements
- TypeScript interfaces
- forwardRef for DOM elements
- Single responsibility

### 4. Implementation Templates

**Simple Component (No Variants):**
```tsx
import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

export const Logo = ({ size = 32, className, ...props }: LogoProps) => (
  <div className={cn("flex items-center", className)} {...props}>
    <img src="/logo.svg" width={size} height={size} alt="Logo" />
  </div>
)
```

**Multi-Variant Component (CVA):**
```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva("inline-flex items-center rounded-lg", {
  variants: {
    variant: {
      default: "bg-primary-500 text-white",
      outline: "border border-neutral-300",
    },
    size: {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
    },
  },
  defaultVariants: { variant: "default", size: "md" },
})

export const StatusBadge = ({ variant, size, className, ...props }: 
  React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>
) => (
  <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
)
```
```

### 5. File Organization
- **shadcn/ui**: `frontend/src/components/ui/` (base components)
- **Features**: `frontend/src/components/features/[feature]/` (feature-specific components)
- Export from index files when needed

```
components/
├── ui/           # shadcn/ui (Button, Card, etc.)
└── features/     # Feature-based organization
    ├── dashboard/
    ├── layout/
    └── class/
```

## Requirements Checklist
- TypeScript interfaces
- Design system tokens only
- Responsive (mobile-first)
- Accessibility (ARIA, keyboard)
- Consistent API patterns
- i18n ready (underscore keys: `button_text`, `aria_label`)
- Performance optimized