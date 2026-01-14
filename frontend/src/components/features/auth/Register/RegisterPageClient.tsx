'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { RegisterForm } from '@/components/features/auth';

export const RegisterPageClient = () => {
  const router = useRouter();

  const handleRegisterSuccess = () => {
    // Redirect to dashboard after successful registration
    router.push('/dashboard');
  };

  const handleSwitchToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-200 via-background to-secondary-200 p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-100 rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onSwitchToLogin={handleSwitchToLogin}
          className="shadow-xl"
        />
      </div>
    </div>
  );
};