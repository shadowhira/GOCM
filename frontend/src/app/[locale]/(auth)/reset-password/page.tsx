import type { Metadata } from 'next';

import { ResetPasswordPageClientLoader } from '@/components/features/auth';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Enter your new password to regain access to PTIT-OCM',
};

export default function ResetPasswordPage() {
  return <ResetPasswordPageClientLoader />;
}