"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * GuestGuard component để protect các routes chỉ dành cho guest (chưa đăng nhập)
 * Ví dụ: Login, Register, Forgot Password
 * Redirect về trang chỉ định nếu user đã đăng nhập
 */
export const GuestGuard: React.FC<GuestGuardProps> = ({
  children,
  redirectTo = "/",
}) => {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  React.useEffect(() => {
    if (isHydrated && isAuthenticated) {
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

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};
