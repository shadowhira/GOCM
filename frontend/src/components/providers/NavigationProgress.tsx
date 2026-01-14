"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

/**
 * Inner component that uses useSearchParams (which needs Suspense boundary)
 */
function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Khi pathname hoặc searchParams thay đổi, có nghĩa là navigation đã hoàn tất
    // Gọi done() để kết thúc progress bar
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}

/**
 * Component để kết thúc TopLoader khi navigation hoàn tất.
 * NextTopLoader tự động start khi click Link, nhưng với programmatic navigation
 * (router.push), chúng ta cần manually handle.
 * 
 * Component này listen vào pathname/searchParams changes để gọi NProgress.done()
 * khi route change hoàn tất.
 */
export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
