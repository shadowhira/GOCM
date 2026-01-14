import httpClient from '@/lib/axios'
import { GetListNotificationRequest, GetTopNotificationRequest, SystemNotificationResponse, PaginatedNotificationResponse } from '@/types/notification'

const url = "Notification";
export const notificationApi = {
  // GET /api/Notification/get-list
  getList: (params?: GetListNotificationRequest): Promise<PaginatedNotificationResponse> =>
    httpClient.get(url + '/get-list', { params }),

  // GET /api/Notification/get-top
  getTop: (request: GetTopNotificationRequest): Promise<SystemNotificationResponse[]> =>
    httpClient.get(url + `/get-top`, {params: request}),

  // PUT /api/Notification/mark-read
  markReaded: (id: number): Promise<void> => httpClient.put(url + `/${id}/mark-read`),

  // PUT /api/Notification/mark-unread
  markUnread: (id: number): Promise<void> => httpClient.put(url + `/${id}/mark-unread`),

  // DELETE /api/Notification/{id}
  hide: (id: number): Promise<void> => httpClient.delete(url + `/${id}`),

  // PUT /api/Notification/mark-all-read
  markAllReaded: (): Promise<void> => httpClient.put(url + `/mark-all-read`),
}
