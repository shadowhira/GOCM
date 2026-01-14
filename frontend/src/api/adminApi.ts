import httpClient from '@/lib/axios'
import type { AdminOverviewResponse } from '@/types/admin'

export const adminApi = {
  /**
   * Get admin overview statistics
   * GET /api/Admin/Overview
   */
  getOverview: (): Promise<AdminOverviewResponse> =>
    httpClient.get('/Admin/Overview'),
}
