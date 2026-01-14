'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/store/auth/useAuthStore';
import { Role } from '@/types/auth';

import { LoginForm } from '@/components/features/auth';

export const LoginPageClient = () => {
  const router = useRouter();
  const user = useCurrentUser();

  const handleLoginSuccess = () => {
    // Redirect based on user role
    // Admin (0) -> admin panel, User (1) -> dashboard
    if (user?.role === Role.Admin) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleSwitchToRegister = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-200 via-background to-secondary-200 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
          onForgotPassword={handleForgotPassword}
          className="shadow-xl"
        />
      </div>
    </div>
  );
};
