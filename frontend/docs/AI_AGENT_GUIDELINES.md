# AI Agent Development Guidelines

## 🤖 Critical Instructions

**MUST** follow patterns in our docs. **ALWAYS** read relevant guides before coding.

## 📚 Documentation Reference

### Component Selection:
- **Simple UI** → `ATOMIC_COMPONENTS_GUIDE.md` (within feature folders)
- **Complex Features** → `COMPLEX_COMPONENTS_GUIDE.md` (feature-based organization)  
- **State/Data/Forms** → `ARCHITECTURE_STANDARDS.md` (patterns & organization)

## 🔄 Workflow

1. **Analyze**: Simple UI element OR complex feature OR needs state/data?
2. **Check Existing**: `ui/` → `features/[domain]/` → Only then create new
3. **Read Docs**: Load relevant guide(s) completely before implementing
4. **Follow Patterns**: Design tokens, TypeScript, file organization, state management

## ⚠️ Non-Negotiables

### 🚫 NEVER:
- Skip checking existing components
- Use hardcoded colors/spacing 
- Over-optimize without profiling
- Mix feature-specific components across features

### ✅ ALWAYS:
- Use design tokens from `design-tokens.ts`
- Reuse existing components first
- Follow established patterns
- Use underscore i18n keys (e.g., `my_classes`, not `"My Classes"`)
- Import `useTranslations` from 'next-intl'
- Use same API (`classApi`, `userApi`) for both Server & Client Components

## 🎯 Success = Seamless integration + Design consistency + Performance without over-optimization