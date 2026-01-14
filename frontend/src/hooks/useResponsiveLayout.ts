import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Viewport types for responsive layout
 */
export type ViewportType = 'mobile' | 'tablet' | 'desktop';

/**
 * Control bar display variants
 */
export type ControlBarVariant = 'full' | 'compact' | 'minimal';

/**
 * Responsive layout configuration
 */
export interface ResponsiveLayoutConfig {
  /** Current viewport type */
  viewport: ViewportType;
  /** Is mobile viewport */
  isMobile: boolean;
  /** Is tablet viewport */
  isTablet: boolean;
  /** Is desktop viewport */
  isDesktop: boolean;
  /** Maximum tiles per page for grid */
  maxTilesPerPage: number;
  /** Whether to show chat as sidebar (desktop) or sheet (mobile/tablet) */
  showSidebarChat: boolean;
  /** Number of grid columns */
  gridColumns: number;
  /** Control bar display variant */
  controlBarVariant: ControlBarVariant;
  /** Current window width */
  windowWidth: number;
  /** Current window height */
  windowHeight: number;
  /** Is landscape orientation */
  isLandscape: boolean;
}

/**
 * Breakpoint configuration
 */
const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
} as const;

/**
 * Grid configuration per viewport
 */
const GRID_CONFIG: Record<ViewportType, { columns: number; maxTiles: number }> = {
  mobile: { columns: 1, maxTiles: 2 },
  tablet: { columns: 2, maxTiles: 4 },
  desktop: { columns: 3, maxTiles: 9 },
};

/**
 * Calculate viewport type from window width
 */
const getViewportType = (width: number): ViewportType => {
  if (width < BREAKPOINTS.tablet) return 'mobile';
  if (width < BREAKPOINTS.desktop) return 'tablet';
  return 'desktop';
};

/**
 * Calculate grid columns based on viewport and participant count
 */
const calculateGridColumns = (
  viewport: ViewportType,
  participantCount: number,
  isLandscape: boolean
): number => {
  const baseColumns = GRID_CONFIG[viewport].columns;
  
  // Adjust for landscape on mobile
  if (viewport === 'mobile' && isLandscape) {
    return Math.min(2, participantCount);
  }
  
  // Adjust columns based on participant count
  if (participantCount <= 1) return 1;
  if (participantCount <= 2) return Math.min(2, baseColumns);
  if (participantCount <= 4) return Math.min(2, baseColumns);
  
  return baseColumns;
};

/**
 * Calculate max tiles per page
 */
const calculateMaxTiles = (
  viewport: ViewportType,
  isLandscape: boolean
): number => {
  const baseTiles = GRID_CONFIG[viewport].maxTiles;
  
  // Increase tiles in landscape mode for mobile
  if (viewport === 'mobile' && isLandscape) {
    return 4;
  }
  
  return baseTiles;
};

/**
 * Custom hook for responsive live room layout
 * 
 * @param participantCount - Number of participants (optional, for grid optimization)
 * @returns ResponsiveLayoutConfig - Layout configuration based on current viewport
 * 
 * @example
 * ```tsx
 * const { viewport, isMobile, maxTilesPerPage, showSidebarChat } = useResponsiveLayout();
 * 
 * if (isMobile) {
 *   return <MobileLayout />;
 * }
 * ```
 */
export function useResponsiveLayout(participantCount: number = 0): ResponsiveLayoutConfig {
  // Initialize state with default values (SSR safe)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.desktop,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  // Handle resize with debounce
  const handleResize = useCallback(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  // Setup resize listener
  useEffect(() => {
    // Set initial size
    handleResize();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    
    // Also listen for orientation change on mobile
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  // Calculate layout configuration
  const config = useMemo<ResponsiveLayoutConfig>(() => {
    const { width, height } = windowSize;
    const viewport = getViewportType(width);
    const isLandscape = width > height;
    
    const isMobile = viewport === 'mobile';
    const isTablet = viewport === 'tablet';
    const isDesktop = viewport === 'desktop';
    
    const gridColumns = calculateGridColumns(viewport, participantCount, isLandscape);
    const maxTilesPerPage = calculateMaxTiles(viewport, isLandscape);
    
    // Chat sidebar only on desktop
    const showSidebarChat = isDesktop;
    
    // Control bar variant
    let controlBarVariant: ControlBarVariant = 'full';
    if (isMobile) {
      controlBarVariant = width < 360 ? 'minimal' : 'compact';
    } else if (isTablet) {
      controlBarVariant = 'compact';
    }

    return {
      viewport,
      isMobile,
      isTablet,
      isDesktop,
      maxTilesPerPage,
      showSidebarChat,
      gridColumns,
      controlBarVariant,
      windowWidth: width,
      windowHeight: height,
      isLandscape,
    };
  }, [windowSize, participantCount]);

  return config;
}

/**
 * Hook to get CSS class names based on viewport
 */
export function useResponsiveClasses() {
  const { viewport, isLandscape } = useResponsiveLayout();
  
  return useMemo(() => ({
    container: `lk-responsive-${viewport}${isLandscape ? ' lk-landscape' : ''}`,
    grid: `lk-grid-${viewport}`,
    controlBar: `lk-control-bar-${viewport}`,
    chat: `lk-chat-${viewport}`,
  }), [viewport, isLandscape]);
}

export default useResponsiveLayout;
