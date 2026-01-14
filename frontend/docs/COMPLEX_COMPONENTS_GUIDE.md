# Complex Components Development Guide

## Overview
Large components like ClassCard, SideBar, Header, page sections, complete interfaces.

## Core Principles

### 1. Composition Strategy (REUSE FIRST)
- Always check existing components before creating new ones
- Only create sub-components when logic separation is essential
- Prefer composition over creation

### 2. Component Hierarchy
```tsx
// ✅ Correct - Reuse existing components in hierarchy
import { Button, Card, Avatar, Badge } from "@/components/ui"
import { AvatarGroup, StatusIndicator } from "@/components/custom" 

export const ClassCard = ({ classData }) => (
  <Card className="p-6">
    <AvatarGroup users={classData.members} />
    <StatusIndicator status={classData.status} />
    <Button variant="primary">Join Class</Button>
  </Card>
)
```

### 3. Implementation Template
```tsx
import { Button, Card, Avatar, Badge } from "@/components/ui"
import { useTranslations } from "@/i18n/useTranslations"

interface ClassCardProps {
  data: ClassData
  onAction?: (action: string) => void
  variant?: "default" | "compact"
}

export const ClassCard = ({ data, onAction, variant = "default" }: ClassCardProps) => {
  const t = useTranslations()

  return (
    <Card className={cn("p-6 space-y-4", { "p-4 space-y-2": variant === "compact" })}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={data.avatar} />
          <div>
            <h3 className="font-semibold">{data.title}</h3>
            <p className="text-neutral-600 text-sm">{data.subtitle}</p>
          </div>
        </div>
        <Badge variant={data.status === 'active' ? 'success' : 'default'}>
          {t(data.status)}
        </Badge>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button variant="primary" onClick={() => onAction?.('join')}>
          {t("Join Class")}
        </Button>
      </div>
    </Card>
  )
}
```

### 4. Component Hierarchy
```
features/dashboard/
├── index.tsx              # Dashboard (main component)
├── DashboardHeader.tsx    # Sub-component
└── DashboardClassCard.tsx # Sub-component

features/layout/header/
├── index.tsx              # Header (main component) 
├── SearchPopup.tsx        # Sub-component
└── LocaleSwitcher.tsx     # Sub-component

ui/                        # shadcn/ui base components
├── Button.tsx
└── Card.tsx
```

### 5. Modal Components (Dialog + Hash Routing)

**Pattern: Hash-based modal state (no page reload)**

```tsx
'use client'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function PageWithModal() {
  const [showModal, setShowModal] = React.useState(false)

  // Sync modal state with URL hash
  React.useEffect(() => {
    const handleHashChange = () => {
      setShowModal(window.location.hash === '#join')
    }
    handleHashChange() // Initial check
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
  
  const open = () => { window.location.hash = 'join' }
  const close = () => { 
    window.history.replaceState(null, '', window.location.pathname)
    setShowModal(false)
  }

  return (
    <>
      <button onClick={open}>Join Class</button>
      <Dialog open={showModal} onOpenChange={close}>
        <DialogContent>{/* content */}</DialogContent>
      </Dialog>
    </>
  )
}
```

**Why Hash?** Next.js App Router lacks shallow routing. Hash changes are client-side only (no page reload).

**Rules**: URL pattern `#action`, hash event listener, Dialog component, clean hash on close.

### 6. Requirements
- Integration with existing components
- TypeScript interfaces from API structure
- i18n with semantic keys
- Responsive design
- Loading states