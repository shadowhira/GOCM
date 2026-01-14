'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ResetPasswordForm } from '@/components/features/auth';

export const ResetPasswordPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? undefined;

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleBackToForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-200 via-background to-secondary-200 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <ResetPasswordForm
          token={token}
          onBackToLogin={handleBackToLogin}
          onBackToForgotPassword={handleBackToForgotPassword}
          className="shadow-xl"
        />
      </div>
    </div>
  );
};
