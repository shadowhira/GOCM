import type { Metadata } from 'next';

import { ForgotPasswordPageClientLoader } from '@/components/features/auth';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Request a password reset link for your PTIT-OCM account',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageClientLoader />;
}