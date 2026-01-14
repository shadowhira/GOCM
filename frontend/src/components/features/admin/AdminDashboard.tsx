'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetAdminOverview } from '@/queries/adminQueries'
import { 
  Users, 
  BookOpen, 
  ShoppingBag, 
  FileText, 
  Send, 
  MessageSquare, 
  Video 
} from 'lucide-react'

export const AdminDashboard = () => {
  const t = useTranslations()
  const { data: overview, isLoading, error } = useGetAdminOverview()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            {t('admin_dashboard')}
          </h1>
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{t('something_went_wrong')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const primaryStats = [
    {
      title: t('total_users'),
      value: overview?.totalUsers || 0,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: t('total_classes'),
      value: overview?.totalClasses || 0,
      icon: BookOpen,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: t('total_shop_items'),
      value: overview?.totalShopItems || 0,
      icon: ShoppingBag,
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
  ]

  const secondaryStats = [
    {
      title: t('total_assignments'),
      value: overview?.totalAssignments || 0,
      icon: FileText,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: t('total_submissions'),
      value: overview?.totalSubmissions || 0,
      icon: Send,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      title: t('total_posts'),
      value: overview?.totalPosts || 0,
      icon: MessageSquare,
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
    {
      title: t('active_live_rooms'),
      value: overview?.activeLiveRooms || 0,
      icon: Video,
      color: 'text-error',
      bgColor: 'bg-error/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
          {t('admin_dashboard')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin_dashboard_description')}
        </p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {primaryStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {secondaryStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
