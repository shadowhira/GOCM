/**
 * Design Tokens for Online Classroom Management System
 * Based on 60-70-20-30 color distribution rule
 */

// Color palette optimized for educational platform
export const colors = {
  // Neutral colors (60-70% usage): backgrounds, text, cards, containers
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6", 
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827"
  },

  // Primary colors (20-30% usage): main branding, key actions, headers
  primary: {
    50: "#e6f7ff",
    100: "#bfe6ff",
    200: "#99d6ff", 
    300: "#73c5ff",
    400: "#4db5ff",
    500: "#0077b6", // Main brand color
    600: "#0061a0",
    700: "#004d82",
    800: "#003964",
    900: "#002748"
  },

  // Secondary colors (<10% usage): supporting elements, badges, links
  secondary: {
    50: "#f0f7ff",
    100: "#d0e9ff",
    200: "#a1d4ff",
    300: "#73bfff", 
    400: "#44aaff",
    500: "#0096c7",
    600: "#007ea3",
    700: "#00637f",
    800: "#004b5c",
    900: "#00343a"
  },

  // Accent colors: highlights, call-to-action, special elements
  accent: {
    50: "#fff8e6",
    100: "#ffedbf",
    200: "#ffe199",
    300: "#ffd473",
    400: "#ffc74d", 
    500: "#ffb700", // Gold for achievements, highlights
    600: "#e6a300",
    700: "#b87f00",
    800: "#8a5c00",
    900: "#5c3900"
  },

  // Utility colors: status, notifications, feedback
  success: "#22c55e",   // Green: completed assignments, success states
  error: "#ef4444",     // Red: errors, urgent notifications  
  warning: "#facc15",   // Yellow: pending assignments, warnings
  info: "#3b82f6",      // Blue: informational messages

  // Additional semantic colors for classroom context
  grade: {
    excellent: "#10b981", // A grades
    good: "#22c55e",      // B grades  
    average: "#f59e0b",   // C grades
    poor: "#ef4444"       // D/F grades
  }
} as const;

// Typography scale for educational content
export const typography = {
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px - small labels
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - body text
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px - default body
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px - large body  
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - headings
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px - page titles
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - main headers
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }]  // 36px - hero text
  },

  fontWeight: {
    normal: '400',
    medium: '500', 
    semibold: '600',
    bold: '700'
  }
} as const;

// Spacing scale optimized for classroom layouts
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px - base unit
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  32: '8rem'        // 128px
} as const;

// Border radius for consistent rounded corners
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px - shadcn default
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px'
} as const;

// Shadow tokens for depth and elevation
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none'
} as const;

// Responsive breakpoints for classroom layouts
export const screens = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet  
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
} as const;

// Animation and transition tokens
export const animation = {
  none: 'none',
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite'
} as const;

export const transitionDuration = {
  75: '75ms',
  100: '100ms', 
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms'
} as const;

// Design tokens object for easy import
export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  screens,
  animation,
  transitionDuration
} as const;

// Type definitions for better TypeScript support
export type ColorTokens = typeof colors;
export type TypographyTokens = typeof typography;
export type SpacingTokens = typeof spacing;
export type DesignTokens = typeof designTokens;