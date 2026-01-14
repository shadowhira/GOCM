'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { ForgotPasswordForm } from '@/components/features/auth';

export const ForgotPasswordPageClient = () => {
  const router = useRouter();

  const handleBackToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-200 via-background to-secondary-200 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-100 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <ForgotPasswordForm onBackToLogin={handleBackToLogin} className="shadow-xl" />
      </div>
    </div>
  );
};
