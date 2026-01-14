# UI Development Prompt Templates (Vietnamese)

**Tham chiếu**: Luôn include `frontend/docs/AI_AGENT_GUIDELINES.md` trong prompt để đảm bảo tính nhất quán.

## 🎯 Template Prompt Cơ Bản

```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước, sau đó tạo [mô tả component].
Tuân thủ tất cả các patterns đã thiết lập và kiểm tra existing components trước khi tạo mới.
```

---

## 📋 Phân Loại Prompt

### 1. Component Atomic Đơn Giản (Không Cần Context Technical)

#### Component Logo Cơ Bản
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo component Logo đơn giản với yêu cầu:
- Hiển thị logo của app
- Có thể config kích thước
- Đặt đúng folder theo guidelines của chúng ta
- Sử dụng design tokens
- Không cần variants - giữ đơn giản
```

#### Status Badge Có Variants
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo component StatusBadge để hiển thị trạng thái class/assignment:
- Variants: active, pending, completed, cancelled
- Sử dụng grade colors cho completed/active states
- Follow CVA pattern như button component của chúng ta
- Hỗ trợ sizes khác nhau: sm, md, lg
- Đặt vào folder phù hợp theo guidelines
```

#### Component Avatar Group
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo component AvatarGroup với các tính năng:
- Hiển thị nhiều avatar users theo dạng stack/row
- Xử lý overflow (ví dụ: "+3 more" indicator)
- Sizes khác nhau: sm, md, lg
- Sử dụng Avatar có sẵn từ shadcn/ui
- Đặt trong feature folder phù hợp (ví dụ: features/class/ nếu dùng cho class)
- Follow patterns cho atomic component
```

### 2. Component Feature Phức Tạp (Context Technical Vừa Phải)

#### Component Class Card
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo component ClassCard để hiển thị thông tin lớp học:
- Hiển thị: tên lớp, thông tin giáo viên, số học sinh, trạng thái
- Actions: Tham gia lớp, Xem chi tiết
- Variants: default, compact
- Tái sử dụng existing UI components (Card, Button, Avatar, Badge)
- Sử dụng design tokens cho spacing và colors
- Hỗ trợ responsive design
- Bao gồm loading state
- Thêm TypeScript interfaces đầy đủ
```

#### Assignment Dashboard
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo component AssignmentDashboard với các tính năng:
- List assignments với filters (due date, status, class)
- Hiển thị assignment cards theo grid layout
- Tính năng search
- Options sorting
- Sử dụng existing components tối đa
- Implement patterns state management đúng cách
- Bao gồm loading và empty states
- Responsive trên tất cả devices
- Thêm hỗ trợ internationalization
```

#### Class Management Sidebar
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo component ClassSidebar cho giao diện quản lý lớp học:
- Navigation items: Overview, Students, Assignments, Grades
- Thiết kế collapsible
- Hiển thị active state
- User avatar và thông tin class ở đầu
- Responsive mobile (drawer trên mobile)
- Sử dụng existing navigation và layout components
- Implement state management đúng cách cho sidebar state
- Hỗ trợ keyboard navigation
```

### 3. Component Xử Lý Data Nặng (Context Technical Cao)

#### Giao Diện Quản Lý Điểm Sinh Viên
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo feature component StudentGradeManagement:
- Table view tất cả học sinh với điểm số
- Tính năng inline editing cho điểm
- Filters và sorting cho điểm
- Chức năng export
- Bulk operations cho điểm
- Real-time updates sử dụng server state patterns
- Form validation với RHF + Zod
- Optimistic updates với error handling
- Sử dụng existing Table, Input, Button components
- Implement loading states và error boundaries đầy đủ
- Thêm comprehensive TypeScript interfaces
- Hỗ trợ pagination cho lớp đông học sinh
```

#### Form Tạo Assignment
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo component AssignmentCreationForm:
- Multi-step form: Thông tin cơ bản → Hướng dẫn → Due dates → Chấm điểm
- Upload file cho attachments
- Rich text editor cho instructions
- Date/time pickers cho due dates
- Validation sử dụng RHF + Zod schemas
- Tính năng lưu draft
- Chế độ preview
- Sử dụng existing form components (Input, Textarea, Select, etc.)
- Implement state management đúng cách cho form state
- Thêm progress indicator
- Hỗ trợ internationalization
- Bao gồm comprehensive error handling
```

#### Giao Diện Chat Real-time
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo feature component ClassChat:
- Giao diện messaging real-time
- Message history với pagination
- User typing indicators
- Chia sẻ file/image
- Message reactions
- Online status indicators
- Sử dụng WebSocket/SSE cho real-time updates
- Implement virtual scrolling cho performance
- Tính năng search message
- Tích hợp emoji picker
- Sử dụng existing Avatar, Button, Input components
- State management đúng cách với Zustand
- Optimistic updates với error handling
- Hỗ trợ mobile responsive design
```

### 4. Component Toàn Page/Route (Context Technical Phức Tạp)

#### Trang Class Dashboard Hoàn Chỉnh
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo page component ClassDashboard hoàn chỉnh:
- Header với thông tin lớp và quick actions
- Stats cards (học sinh, assignments, hoạt động gần đây)
- Section assignments gần đây
- Deadlines sắp tới
- Class activity feed
- Quick access cho common actions
- Responsive layout (desktop/tablet/mobile)
- Server-side rendering với data prefetching
- Multiple data sources (classes, assignments, activities)
- Loading states cho từng section
- Error boundaries với retry functionality
- Breadcrumb navigation
- Sử dụng established page layout patterns
- Comprehensive internationalization
- SEO optimization
```

#### Trang Quản Lý Student Profile
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo page StudentProfile management:
- Student info header với avatar và thông tin cơ bản
- Tabbed interface: Overview, Grades, Assignments, Activity
- Grade history với charts/graphs
- Assignment submission history
- Performance analytics
- Section communication với phụ huynh
- Tính năng edit profile với permission checks
- Form validation và state management
- Data visualization cho grade trends
- Chức năng export cho reports
- File upload cho profile pictures
- Audit trail cho changes
- Sử dụng chart libraries cho analytics
- Implement caching strategies đúng cách
- Mobile-first responsive design
- Comprehensive error handling
```

### 5. Component Tích Hợp Hệ Thống (Context Technical Nâng Cao)

#### Dashboard Phân Tích Điểm Nâng Cao
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo feature component AdvancedGradeAnalytics:
- Interactive charts hiển thị phân bố điểm
- So sánh performance giữa các lớp
- Phân tích xu hướng theo thời gian
- Tracking tiến độ từng học sinh
- Predictive analytics cho học sinh có nguy cơ
- Chức năng export PDF/Excel
- Filter theo date ranges, classes, assignments
- Real-time data updates
- Tích hợp external analytics APIs
- Advanced data visualization với D3.js/Chart.js
- Performance optimization cho large datasets
- Caching strategies cho computed analytics
- Background data processing
- Advanced TypeScript với complex data structures
- Comprehensive testing requirements
- Accessibility cho data visualizations
```

#### Hệ Thống Learning Management Tích Hợp
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Tạo LearningManagementSystem integration hoàn chỉnh:
- Quản lý nội dung khóa học
- Assignment workflow engine
- Hệ thống chấm điểm tự động
- Tracking tiến độ học sinh
- Teacher analytics dashboard
- Tích hợp parent portal
- Tích hợp external tools (Google Classroom, Canvas)
- Hệ thống notification (email, SMS, push)
- Advanced permission system
- Content versioning và backup
- Multi-tenant architecture considerations
- Advanced caching và performance optimization
- Tích hợp learning analytics platforms
- Tuân thủ educational standards (FERPA, etc.)
- Comprehensive audit logging
- Advanced search và indexing
- Real-time collaborative features
- Mobile app API endpoints
```

---

## 🔧 Prompt Chuyên Biệt

### Performance Optimization
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Review và optimize component [ComponentName]:
- Profile các performance issues hiện tại
- Identify unnecessary re-renders
- Implement memoization phù hợp
- Optimize bundle size
- Thêm virtualization nếu cần
- Follow performance guidelines của chúng ta (profile first!)
```

### Accessibility Enhancement
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Enhance [ComponentName] cho accessibility:
- Thêm proper ARIA labels và roles
- Đảm bảo keyboard navigation
- Implement focus management
- Thêm screen reader support
- Test với accessibility tools
- Follow WCAG 2.1 AA standards
```

### Mobile Responsiveness
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Làm [ComponentName] responsive hoàn toàn:
- Mobile-first design approach
- Touch-friendly interactions
- Breakpoints phù hợp sử dụng design tokens
- Test trên different screen sizes
- Optimize cho mobile performance
- Consider mobile-specific UX patterns
```

### Internationalization
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.

Thêm comprehensive i18n support cho [ComponentName]:
- Extract tất cả text ra translation files
- Sử dụng underscore translation keys (e.g., `my_classes`, `create_new_class`)
- Support EN/VI languages
- Import `useTranslations` from 'next-intl'
```

---

## ⚡ Quick Action Prompts

### Bug Fix
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.
Fix issue trong [ComponentName]: [mô tả issue]
Đảm bảo fix tuân thủ established patterns và không break existing functionality.
```

### Feature Enhancement
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.
Thêm [mô tả feature] vào [ComponentName].
Tái sử dụng existing components tối đa và follow design system.
```

### Refactoring
```
Hãy đọc frontend/docs/AI_AGENT_GUIDELINES.md trước.
Refactor [ComponentName] để improve [specific aspect: performance/maintainability/readability].
Đảm bảo tất cả existing functionality được preserve và patterns được follow.
```

---

## 📝 Best Practices Khi Prompt

1. **Luôn reference AI_AGENT_GUIDELINES.md trước tiên**
2. **Cụ thể về requirements và constraints**
3. **Mention existing components nào nên được reuse**
4. **Specify technical requirements (forms, state management, etc.)**
5. **Include acceptance criteria cho complex features**
6. **Mention responsive design requirements**
7. **Specify internationalization needs**
8. **Include performance considerations cho complex components**
9. **Add accessibility requirements khi relevant**
10. **Specify testing requirements cho critical features**