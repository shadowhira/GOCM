import { Metadata } from 'next'
import { NotificationsPageLoader } from '@/components/features/notifications/NotificationsPageLoader'
import { NOTIFICATIONS_PAGINATION } from '@/config/pagination'

const DEFAULT_PAGE = NOTIFICATIONS_PAGINATION.DEFAULT_PAGE_NUMBER
const DEFAULT_PAGE_SIZE = NOTIFICATIONS_PAGINATION.DEFAULT_PAGE_SIZE

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View and manage your notifications',
}

export default function NotificationsRoute() {
  return <NotificationsPageLoader initialPage={DEFAULT_PAGE} initialPageSize={DEFAULT_PAGE_SIZE} />
}
