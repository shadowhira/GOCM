"use client";

import LocaleSwitcher from "@/components/features/layout/header/RightSection/LocaleSwitcher";
import ThemeSwitcher from "@/components/features/layout/header/RightSection/ThemeSwitcher";
import { GuestGuard } from "@/components/features/auth";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <GuestGuard redirectTo="/">
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50">
        {children}
        <div className="flex flex-row absolute top-4 right-4">
          <LocaleSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </GuestGuard>
  );
}
