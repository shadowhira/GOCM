import { Metadata } from 'next'
import { Header } from '@/components/features/layout/header'
import { AuthGuard, RoleGuard } from '@/components/features/auth'
import { AdminLayout } from '@/components/features/admin/AdminLayout'
import { Role } from '@/types/auth'

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Admin panel for managing users and shop items',
}

interface AdminLayoutPageProps {
  children: React.ReactNode
  params: Promise<{
    locale: string
  }>
}

export default async function AdminLayoutPage({ children }: AdminLayoutPageProps) {
  return (
    <AuthGuard redirectTo="/login">
      <RoleGuard allowedRoles={[Role.Admin]} redirectTo="/forbidden">
        <div className="min-h-screen bg-background">
          <Header mode="admin" />
          <AdminLayout>
            {children}
          </AdminLayout>
        </div>
      </RoleGuard>
    </AuthGuard>
  )
}
