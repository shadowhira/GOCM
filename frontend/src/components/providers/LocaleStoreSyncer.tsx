'use client';

import { useLocaleSync } from '@/store';

/**
 * Component client đơn giản để sync locale store với URL
 * Sử dụng trong layout để tự động sync toàn app
 */
export function LocaleStoreSyncer() {
  useLocaleSync();
  return null; // Component này không render gì cả
}