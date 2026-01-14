export enum SystemNotificationStatus {
  New,
  Read,
}

export interface SystemNotificationResponse {
  id: number,
  status: SystemNotificationStatus,
  isRead?: boolean,
  type?: string,
  data?: Record<string, string | number | Date>,
  senderAvatarUrl: string,
  senderName: string,
  createdAt: string,
  linkRedirect: string,
  openNewTab: boolean
}

export interface GetTopNotificationRequest {
  top: number
}

export interface GetListNotificationRequest {
  keyword?: string;
  pageNumber: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  status?: SystemNotificationStatus;
}


export interface PaginatedNotificationResponse {
  items: SystemNotificationResponse[],
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}
