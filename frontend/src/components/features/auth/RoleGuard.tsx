"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Role } from "@/types/auth";
import { useAuthStore } from "@/store/auth";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Role[];
  redirectTo?: string;
}

/**
 * RoleGuard bảo vệ các route cần quyền cụ thể (ví dụ: Admin)
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  redirectTo = "/",
}) => {
  const router = useRouter();
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const hasRole = React.useMemo(() => {
    if (!user) return false;
    return allowedRoles.includes(user.role as Role);
  }, [allowedRoles, user]);

  React.useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated || !hasRole) {
      router.replace(redirectTo);
    }
  }, [isHydrated, isAuthenticated, hasRole, redirectTo, router]);

  if (!isHydrated || !hasRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};
