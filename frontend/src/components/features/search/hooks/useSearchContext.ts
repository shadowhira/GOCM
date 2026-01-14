/**
 * useSearchContext Hook
 * Detects the current search context (Dashboard or Class Detail)
 */

import { useParams, usePathname } from 'next/navigation';
import { useMemo } from 'react';
import type { SearchContext, UseSearchContextReturn } from '../SearchCommand/types';

export function useSearchContext(
  overrideContext?: Partial<SearchContext>
): UseSearchContextReturn {
  const params = useParams();
  const pathname = usePathname();
  
  const context = useMemo<SearchContext>(() => {
    // Check if we're in a class detail page
    const classId = params?.classId as string | undefined;
    const isInClassPage = pathname?.includes('/class/') && classId;

    if (overrideContext?.mode) {
      return {
        mode: overrideContext.mode,
        classId: overrideContext.classId,
        className: overrideContext.className,
      };
    }

    if (isInClassPage && classId) {
      return {
        mode: 'class',
        classId: parseInt(classId, 10),
        className: overrideContext?.className,
      };
    }

    return {
      mode: 'dashboard',
    };
  }, [params?.classId, pathname, overrideContext]);

  return {
    context,
    isClassContext: context.mode === 'class',
    isDashboardContext: context.mode === 'dashboard',
  };
}
