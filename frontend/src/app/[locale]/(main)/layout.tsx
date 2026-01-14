import { ReactNode } from "react";
import { AuthGuard } from "@/components/features/auth";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Layout cho các trang cần authentication (dashboard, class, etc.)
 * Sử dụng AuthGuard để tự động redirect về login khi chưa đăng nhập
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <AuthGuard redirectTo="/login">
      {children}
    </AuthGuard>
  );
}