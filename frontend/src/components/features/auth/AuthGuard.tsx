"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * AuthGuard component để protect các routes cần authentication
 * Redirect về login page nếu user chưa đăng nhập
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  redirectTo = "/login",
}) => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  React.useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isHydrated, isAuthenticated, redirectTo, router]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};
