import type { Metadata } from 'next';

import { RegisterPageClientLoader } from '@/components/features/auth';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account for the PTIT-OCM online classroom management system',
};

export default function RegisterPage() {
  return <RegisterPageClientLoader />;
}