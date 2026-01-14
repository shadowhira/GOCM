'use client';

import { useEffect } from 'react';
import { useCurrentTheme } from '@/store/theme/useThemeStore';

/**
 * ThemeProvider - Load CSS theme dynamically
 * Component này không render gì, chỉ quản lý việc load theme CSS
 */
export function ThemeProvider() {
  const currentTheme = useCurrentTheme();

  useEffect(() => {
    // ID cho theme link element
    const THEME_LINK_ID = 'app-theme-stylesheet';
    
    // Remove existing theme link nếu có
    const existingLink = document.getElementById(THEME_LINK_ID);
    if (existingLink) {
      existingLink.remove();
    }

    // Create và append theme link mới
    const link = document.createElement('link');
    link.id = THEME_LINK_ID;
    link.rel = 'stylesheet';
    link.href = `/themes/ocean-${currentTheme}.css`;
    
    // Insert vào đầu head để có priority cao
    document.head.insertBefore(link, document.head.firstChild);

    // Cleanup function
    return () => {
      const linkToRemove = document.getElementById(THEME_LINK_ID);
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [currentTheme]);

  return null; // Component này không render gì cả
}
