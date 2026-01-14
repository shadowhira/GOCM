import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/api/notificationsApi";
import { GetListNotificationRequest, GetTopNotificationRequest, SystemNotificationResponse } from "@/types/notification";


// ============ QUERY KEYS ============
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"],
  list: (params: GetListNotificationRequest) =>
    [...notificationKeys.lists(), params] as const,
  tops: () => [...notificationKeys.all, "get-top"],
  top: (params: GetTopNotificationRequest) => [...notificationKeys.tops(), params] as const,
};


// ============ QUERIES (GET) ============
// /**
//  * Lấy danh sách tin nhắn của user
//  */
export const useGetListNotification = (params: GetListNotificationRequest) => {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationApi.getList(params),
  });
};

/**
 * Lấy top n tin nhắn mới nhất
 */
export const useGetTopNotifications = (params: GetTopNotificationRequest) => {
  return useQuery({
    queryKey: notificationKeys.top(params),
    queryFn: () => notificationApi.getTop(params),
  });
};


// ============ MUTATIONS (POST/PUT/DELETE) ============
export const useMarkAsReaded = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationApi.markReaded(id),
    onSuccess: () => {
      // Refresh
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAsUnread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationApi.markUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useHideNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationApi.hide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

export const useMarkAllAsReaded = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllReaded(),
    onSuccess: () => {
      // Refresh
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};
