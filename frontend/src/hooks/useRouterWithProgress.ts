"use client";

import { useRouter as useNextRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import NProgress from "nprogress";

/**
 * Custom useRouter hook that triggers NProgress loading bar on navigation.
 * This is needed because:
 * 1. nextjs-toploader only auto-triggers for <Link> clicks, not programmatic router.push()
 * 2. next-intl can conflict with nextjs-toploader's built-in useRouter
 * 
 * Usage: Replace `import { useRouter } from "next/navigation"` with 
 *        `import { useRouterWithProgress } from "@/hooks/useRouterWithProgress"`
 */
export function useRouterWithProgress() {
  const router = useNextRouter();

  const push = useCallback(
    (href: string, options?: Parameters<typeof router.push>[1]) => {
      NProgress.start();
      router.push(href, options);
    },
    [router]
  );

  const replace = useCallback(
    (href: string, options?: Parameters<typeof router.replace>[1]) => {
      NProgress.start();
      router.replace(href, options);
    },
    [router]
  );

  const back = useCallback(() => {
    NProgress.start();
    router.back();
  }, [router]);

  const forward = useCallback(() => {
    NProgress.start();
    router.forward();
  }, [router]);

  return useMemo(
    () => ({
      ...router,
      push,
      replace,
      back,
      forward,
    }),
    [router, push, replace, back, forward]
  );
}
