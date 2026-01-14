import type { Metadata } from 'next';

import { LoginPageClientLoader } from '@/components/features/auth';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to the PTIT-OCM online classroom management system',
};

export default function LoginPage() {
  return <LoginPageClientLoader />;
}