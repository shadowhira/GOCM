import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  currentClassModule: string
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setCurrentModule: (module: string) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      currentClassModule: 'posts',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setCurrentModule: (module: string) => set({ currentClassModule: module }),
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        sidebarOpen: state.sidebarOpen,
        currentClassModule: state.currentClassModule 
      }),
    }
  )
)

// Selectors
export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen)
export const useToggleSidebar = () => useUIStore((state) => state.toggleSidebar)
export const useCurrentModule = () => useUIStore((state) => state.currentClassModule)
export const useSetCurrentModule = () => useUIStore((state) => state.setCurrentModule)