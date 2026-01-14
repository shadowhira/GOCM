# Frontend Architecture & Development Standards

## Component Design

### 1. Clean Structure
- **Props**: TypeScript interfaces, avoid prop drilling >2 levels
- **State**: Minimize local state, lift when shared
- **Optimization**: Profile (đo đạc, phân tích hiệu năng thực tế của ứng dụng, thay vì tối ưu bừa) first, optimize only when needed
- **Composition**: Prefer over inheritance

```tsx
// ✅ Clean (optimize only when profiling shows issues)
export const Component = ({ data, onUpdate }: ComponentProps) => {
  const handleUpdate = (newData: Partial<ComponentData>) => {
    onUpdate(data.id, newData)
  }
  return <div>{/* content */}</div>
}

// ✅ Optimize when needed (heavy computation/frequent re-renders)
export const HeavyComponent = React.memo(({ items }: { items: Item[] }) => {
  const expensiveValue = useMemo(() => 
    items.reduce((acc, item) => acc + complexCalculation(item), 0), [items]
  )
  return <div>{expensiveValue}</div>
})
```

## State Management

### 2. Client State (Zustand) - `frontend/src/store/[domain]/`
```tsx
// Follow pattern from store/locale/useLocaleStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(persist(
  (set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  }),
  { name: 'ui-store' }
))
```

### 3. Server State (TanStack Query) - `frontend/src/queries/[domain]Queries.ts`
```tsx
// Follow pattern from queries/classQueries.ts
export const useGetClassMembers = (classId: number) => {
  return useQuery({
    queryKey: classKeys.members(classId),
    queryFn: () => classApi.getMembers(classId),
    enabled: !!classId,
  })
}
```

### 3. Server State (TanStack Query)
- Create query hooks in `frontend/src/queries/[domain]Queries.ts`
- Follow pattern from `queries/classQueries.ts`
- Use for API data, caching, background updates

```tsx
// Example pattern from existing queries
export const useGetClassMembers = (classId: number) => {
  return useQuery({
    queryKey: classKeys.members(classId),
    queryFn: () => classApi.getMembers(classId),
    enabled: !!classId,
  })
}
```

## Core Patterns

### 4. i18n - `frontend/src/i18n/locales/[lang].json`
```json
// ✅ Underscore keys (NextIntlClientProvider compatible)
{
  "welcome_to_our_app": "Welcome to our app!",
  "create_new_class": "Create new class",
  "my_classes": "My Classes",
  "search_placeholder": "Search for classes, assignments, or resources..."
}
```

**Important**: Use underscore format (`my_classes`) instead of dot notation (`"My Classes"`) to avoid NextIntlClientProvider INVALID_KEY errors.

```tsx
// ✅ Component usage
import { useTranslations } from 'next-intl'

const Component = () => {
  const t = useTranslations()
  return <h1>{t('my_classes')}</h1>
}
```

### 5. SSR with TanStack Query

**Authentication works automatically in both SSR and CSR** - axios reads token from cookies.

```tsx
// ✅ Same API works everywhere (Server & Client Components)
import { classApi } from '@/api/classApi'

// Server Component
export default async function Page() {
  const data = await classApi.getById(1) // Works!
  return <div>{data.name}</div>
}

// Client Component  
'use client'
export function ClassView() {
  const { data } = useQuery({
    queryKey: ['class', 1],
    queryFn: () => classApi.getById(1) // Works!
  })
  return <div>{data?.name}</div>
}
```

**SSR with Prefetch**:
```tsx
// page.tsx
import { classApi } from '@/api/classApi'
import { getServerQueryClient } from '@/lib/serverQueryClient'

export default async function Page() {
  const queryClient = getServerQueryClient()
  
  await queryClient.prefetchQuery({
    queryKey: classKeys.list(),
    queryFn: () => classApi.getList(), // Same API!
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassesList />
    </HydrationBoundary>
  )
}
```

**How it works**: Axios automatically reads token from cookies in SSR (via dynamic import of `next/headers`) and CSR (via `js-cookie`).

### 6. Forms (RHF + Zod) - `frontend/src/schemas/[domain]Schema.ts`
```tsx
export const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  maxStudents: z.number().min(1).max(100),
})

const { register, handleSubmit } = useForm<CreateClassForm>({
  resolver: zodResolver(createClassSchema)
})
```

### 7. TypeScript Types - `frontend/src/types/[domain].ts`
```tsx
// Base on API structure + component needs
export interface ClassData {
  id: number
  name: string
  teacherId: number
  studentCount: number
}
```

### 8. Component Organization
```
components/
├── ui/                    # shadcn/ui base components
└── features/             # Feature-based organization
    ├── dashboard/
    │   ├── index.tsx     # Main Dashboard component
    │   ├── DashboardHeader.tsx
    │   └── DashboardClassCard.tsx
    └── layout/
        └── header/
            ├── index.tsx # Main Header component
            ├── SearchPopup.tsx
            └── LocaleSwitcher.tsx
```

## Performance (Profile First!)

### When to Optimize
- **React.memo**: Frequent re-renders with same props
- **useMemo**: Expensive calculations (>10ms)
- **useCallback**: Memoized children or effect dependencies

### Always Apply
- Virtualization for lists >100 items
- Lazy load with React.lazy()
- Proper dependency arrays

```tsx
// ❌ Over-optimization (unnecessary overhead)
const SimpleComponent = React.memo(({ name }: { name: string }) => {
  const displayName = useMemo(() => name.toUpperCase(), [name])
  return <div>{displayName}</div>
})

// ✅ Appropriate optimization
const ExpensiveList = React.memo(({ items }: { items: Item[] }) => {
  const filteredItems = useMemo(() => 
    items.filter(item => heavyFilterLogic(item)), [items] // Expensive!
  )
  return <VirtualizedList items={filteredItems} />
})
```