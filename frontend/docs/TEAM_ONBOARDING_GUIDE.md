# Team Onboarding Guide - AI-Assisted UI Development

Hướng dẫn team tiếp cận phát triển UI thông qua AI Agent theo rules đã thiết lập.

---

## 🎯 Tổng Quan

Chúng ta đã xây dựng một hệ thống design system và rules để phát triển UI một cách nhất quán thông qua AI Agent. Guide này giúp team hiểu và áp dụng hiệu quả.

---

## 📚 Hiểu Các Khái Niệm Cơ Bản

### 1. Design Tokens Là Gì?
**Design tokens** = Những giá trị thiết kế được định nghĩa sẵn (màu sắc, khoảng cách, font size, etc.)

**Tại sao quan trọng**: Đảm bảo giao diện nhất quán across toàn bộ app.

**Ví dụ**:
```tsx
// ❌ Sai - hardcode
<button className="bg-blue-600 text-white px-3 py-1.5">

// ✅ Đúng - dùng design tokens  
<button className="bg-primary-500 text-white px-4 py-2">
```

**File tham khảo**: `frontend/src/lib/design-tokens.ts`

### 2. Component Variants Là Gì?
**Variants** = Các phiên bản khác nhau của cùng 1 component (ví dụ: Button có variant primary, secondary, outline)

**Khi nào cần variants**:
- Component có nhiều cách hiển thị khác nhau
- Cần flexibility trong usage
- Ví dụ: Button, Badge, Card

**Khi nào KHÔNG cần variants**:
- Component đơn giản, chỉ 1 cách hiển thị
- Ví dụ: Logo, Divider

**Tool sử dụng**: CVA (Class Variance Authority) - giúp quản lý variants dễ dàng

### 3. State Management - Client State vs Server State

#### Client State (Zustand)
**Là gì**: Dữ liệu UI, user preferences, form state - chỉ tồn tại trong browser

**Khi nào dùng**:
- Sidebar open/close
- Theme light/dark
- Current tab selection
- Form input values (temporary)

**File tổ chức**: `frontend/src/store/[domain]/`

**Ví dụ**:
```tsx
// UI state cho sidebar
const useUIStore = create((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}))
```

#### Server State (TanStack Query)
**Là gì**: Dữ liệu từ API, cần caching, sync với server

**Khi nào dùng**:
- Danh sách classes
- Student grades
- Assignment details
- Any data từ backend API

**File tổ chức**: `frontend/src/queries/[domain]Queries.ts`

**Ví dụ**:
```tsx
// Server state cho classes
const useGetClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: () => classApi.getAll(),
  })
}
```

### 4. Component Organization

#### 2 Levels Component:
1. **`ui/`** - shadcn/ui components (Button, Card, Input) - CÓ SẴN
2. **`features/`** - Feature-based organization (dashboard/, layout/, class/)

**Rule**: Luôn check `ui/` và `features/[domain]/` trước khi tạo component mới!

**Structure Example**:
```
features/
├── dashboard/
│   ├── index.tsx
│   └── DashboardClassCard.tsx
├── layout/header/
│   ├── index.tsx
│   └── SearchPopup.tsx
└── class/
    ├── index.tsx
    └── ClassSidebar.tsx
```

---

## 🔄 Workflow Thực Tế

### Bước 1: Phân Tích Requirement
**Câu hỏi tự hỏi**:
- Component này đơn giản hay phức tạp?
- Cần variants không?
- Cần state management không? (xem chi tiết ở Bước 1.1)
- Cần forms không?

#### Bước 1.1: Phân Tích State Management Chi Tiết

**❓ Câu hỏi phân tích**:
1. Component này có cần lưu trữ data không?
2. Data này từ đâu? (User input, API, UI state)
3. Data này cần share với component khác không?
4. Data này cần persist (cập nhật client luôn để UI cảm thấy thay đổi luôn, thay vì đợi response từ server mới cập nhật) khi user refresh trang không?

**🎯 Decision Tree**:

```
Data từ API/Backend? 
├─ YES → Server State (TanStack Query)
│   ├─ GET data → useQuery
│   ├─ POST/PUT/DELETE → useMutation  
│   └─ Cần SSR → prefetchQuery trong page.tsx
│
└─ NO → Client State
    ├─ UI state (sidebar, modal, theme) → Zustand
    ├─ Form state (temporary) → React Hook Form
    └─ Component state (toggle, counter) → useState
```

**📋 Server State Scenarios (TanStack Query)**:
- ✅ Lấy danh sách classes từ BE → `useQuery`
- ✅ Tạo assignment mới → `useMutation`
- ✅ Update student grade → `useMutation`
- ✅ Search assignments → `useQuery` với params
- ✅ Real-time notifications → `useQuery` với refetch

**Implementation Steps**:
1. **Tạo API function** trong `src/api/[domain]Api.ts`
2. **Tạo query hooks** trong `src/queries/[domain]Queries.ts`
3. **Use trong component**:
```tsx
// GET data
const { data, isLoading, error } = useGetClasses()

// POST/PUT/DELETE data  
const createClass = useCreateClass()
const handleCreate = () => createClass.mutate(formData)
```

**📋 Client State Scenarios (Zustand)**:
- ✅ Sidebar open/close → Zustand store
- ✅ Current theme (light/dark) → Zustand store
- ✅ User preferences → Zustand store
- ✅ Modal state management → Zustand store
- ✅ Multi-step form wizard state → Zustand store

**Implementation Steps**:
1. **Tạo store** trong `src/store/[domain]/use[Domain]Store.ts`
2. **Define state & actions**:
```tsx
interface UIState {
  sidebarOpen: boolean
  currentTab: string
  toggleSidebar: () => void
  setCurrentTab: (tab: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      currentTab: 'overview',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setCurrentTab: (tab) => set({ currentTab: tab }),
    }),
    { name: 'ui-store' } // persist in localStorage
  )
)
```
3. **Use trong component**:
```tsx
const { sidebarOpen, toggleSidebar } = useUIStore()
```

### Bước 2: Chọn Docs Phù Hợp
- **Component nhỏ, đơn giản** → `ATOMIC_COMPONENTS_GUIDE.md`
- **Component lớn, phức tạp** → `COMPLEX_COMPONENTS_GUIDE.md`  
- **Cần state/forms/data** → `ARCHITECTURE_STANDARDS.md`

### Bước 3: Chọn Prompt Template
- **Đơn giản**: Dùng basic prompts trong `PROMPT_TEMPLATES.md`
- **Custom phức tạp hơn**: Dùng advanced prompts với context đầy đủ

### Bước 4: Prompt AI Agent
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

[Paste prompt từ PROMPT_TEMPLATES.md]
```

---

## 💡 Practical Examples

### Example 1: Tạo Simple Component
**Scenario**: Cần component hiển thị logo app

**Phân tích**:
- ✅ Component đơn giản
- ✅ Không cần variants (chỉ cần config size)
- ✅ Không cần state

**Action**:
1. Đọc `ATOMIC_COMPONENTS_GUIDE.md`
2. Dùng prompt "Component Logo Cơ Bản" từ `PROMPT_TEMPLATES.md`

### Example 2: Tạo Complex Component  
**Scenario**: Cần component ClassCard hiển thị thông tin lớp học

**Phân tích**:
- ✅ Component phức tạp
- ✅ Cần variants (default, compact)
- ✅ Cần reuse existing components
- ✅ Có actions (Join class, View details)

**Action**:
1. Đọc `COMPLEX_COMPONENTS_GUIDE.md`
2. Dùng prompt "Component Class Card" từ `PROMPT_TEMPLATES.md`

### Example 3: Component Với Server State
**Scenario**: Cần component ClassList hiển thị danh sách lớp học

**Phân tích State**:
- ✅ Cần data từ API → Server State
- ✅ Data cần cache → TanStack Query
- ✅ Cần loading state → useQuery provides

**Implementation Flow**:
1. **API function**: `classApi.getAll()` trong `src/api/classApi.ts`
2. **Query hook**: `useGetClasses()` trong `src/queries/classQueries.ts`
3. **Component**: Sử dụng hook và handle loading/error states

**Action**:
1. Đọc `ARCHITECTURE_STANDARDS.md` (server state section)
2. Dùng prompt "Component với Server State" từ `PROMPT_TEMPLATES.md`

### Example 4: Component Với Client State
**Scenario**: Cần component Sidebar có thể collapse/expand

**Phân tích State**:
- ✅ UI state (open/close) → Client State
- ✅ Cần persist qua sessions → Zustand với persist
- ✅ Share với nhiều components → Zustand store

**Implementation Flow**:
1. **Store**: `useUIStore()` trong `src/store/ui/useUIStore.ts`
2. **State**: `sidebarOpen`, `toggleSidebar`
3. **Component**: Sử dụng store và trigger actions

**Action**:
1. Đọc `ARCHITECTURE_STANDARDS.md` (client state section)
2. Dùng prompt "Component với Client State" từ `PROMPT_TEMPLATES.md`

### Example 5: Form Component Với Mixed State
**Scenario**: Cần form tạo assignment mới

**Phân tích State**:
- ✅ Form data → React Hook Form (temporary)
- ✅ Submit to API → TanStack Mutation
- ✅ Form wizard progress → Zustand (nếu complex)

**Implementation Flow**:
1. **Form Schema**: `createAssignmentSchema` trong `src/schemas/assignmentSchema.ts`
2. **API Mutation**: `useCreateAssignment()` trong `src/queries/assignmentQueries.ts`
3. **Form State**: RHF với validation
4. **UI State**: Zustand cho wizard steps (nếu cần)

**Action**:
1. Đọc `ARCHITECTURE_STANDARDS.md` (forms + state sections)
2. Dùng prompt "Form với Mixed State" từ `PROMPT_TEMPLATES.md`

---

## ⚠️ Common Mistakes & Solutions

### State Management Mistakes:

#### Mistake 1: Nhầm lẫn Client State vs Server State
**❌ Sai**: Dùng Zustand để store data từ API
```tsx
// Wrong approach
const useClassStore = create((set) => ({
  classes: [],
  setClasses: (classes) => set({ classes })
}))

// Fetch trong component và set vào store
useEffect(() => {
  classApi.getAll().then(setClasses)
}, [])
```

**✅ Đúng**: Dùng TanStack Query cho server data
```tsx
// Correct approach
const { data: classes, isLoading } = useGetClasses()
```

#### Mistake 2: Không dùng cache của TanStack Query
**❌ Sai**: Fetch lại data mỗi lần component mount
**✅ Đúng**: TanStack Query tự động cache, chỉ cần define queryKey đúng

#### Mistake 3: Dùng useState cho UI state global
**❌ Sai**: Prop drilling sidebar state xuống nhiều levels
**✅ Đúng**: Dùng Zustand store cho UI state cần share

### Component Structure Mistakes:

#### Mistake 4: Tạo component mà không check existing
**❌ Sai**: "Tôi cần component Button màu xanh"
**✅ Đúng**: Check `ui/button.tsx` → thấy đã có variant primary màu xanh → dùng luôn

#### Mistake 5: Hardcode colors/spacing
**❌ Sai**: `className="bg-blue-600 p-3"`
**✅ Đúng**: `className="bg-primary-500 p-4"` (dùng design tokens)

#### Mistake 6: Over-optimize từ đầu
**❌ Sai**: Thêm React.memo, useMemo cho component đơn giản
**✅ Đúng**: Profile (đo đạc, phân tích hiệu năng thực tế của ứng dụng, thay vì tối ưu bừa) trước, optimize sau khi thấy performance issues

#### Mistake 7: Tạo variants không cần thiết
**❌ Sai**: Logo component với 5 variants khác nhau
**✅ Đúng**: Logo đơn giản, chỉ config size

---

## 🚀 Quick Start Checklist

### Lần đầu tiên:
- [ ] Đọc `AI_AGENT_GUIDELINES.md` để hiểu overview
- [ ] Browse qua `design-tokens.ts` để biết có những tokens gì
- [ ] Check folder `components/ui/` để biết có components gì sẵn
- [ ] Đọc `PROMPT_TEMPLATES.md` để biết có template nào

### Khi tạo component mới:
- [ ] Phân tích: đơn giản hay phức tạp?
- [ ] Check existing components trong `ui/` và `custom/`
- [ ] Chọn docs guide phù hợp
- [ ] Chọn prompt template phù hợp
- [ ] Include `AI_AGENT_GUIDELINES.md` trong prompt
- [ ] Review output để đảm bảo follow patterns

---

## 🤝 Team Collaboration

### Code Review Checklist:
- [ ] Component follow đúng file organization
- [ ] Sử dụng design tokens (không hardcode)
- [ ] Reuse existing components tối đa
- [ ] TypeScript interfaces đầy đủ
- [ ] i18n underscore keys (e.g., `my_classes`) nếu có text
- [ ] Responsive design

---

## 📖 References

### Must-Read Docs (theo thứ tự):
1. `AI_AGENT_GUIDELINES.md` - Overview và workflow
2. `ATOMIC_COMPONENTS_GUIDE.md` - Component nhỏ
3. `COMPLEX_COMPONENTS_GUIDE.md` - Component lớn  
4. `ARCHITECTURE_STANDARDS.md` - Patterns tổng thể
5. `PROMPT_TEMPLATES.md` - Templates để prompt

### Key Files:
- `design-tokens.ts` - Tất cả design values
- `components/ui/` - shadcn/ui components có sẵn
- `components/ui/button.tsx` - Example CVA pattern
- `components/features/dashboard/` - Example feature organization
- `components/features/layout/header/` - Example nested feature structure
- `store/locale/useLocaleStore.ts` - Example Zustand pattern
- `queries/classQueries.ts` - Example TanStack Query pattern

---
