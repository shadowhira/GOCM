"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import {
  useGetListNotification,
  useMarkAsReaded,
  useMarkAsUnread,
  useHideNotification,
  useMarkAllAsReaded,
  notificationKeys,
} from "@/queries/notificationQueries";
import { NOTIFICATIONS_PAGINATION } from "@/config/pagination";
import { SystemNotificationStatus } from "@/types/notification";
import { NotificationsHeader } from "./sections/NotificationsHeader";
import { NotificationsFilters } from "./sections/NotificationsFilters";
import { NotificationsList } from "./sections/NotificationsList";
import { NotificationsPagination } from "./sections/NotificationsPagination";
import { NotificationsEmptyState } from "./sections/NotificationsEmptyState";
import { NotificationsSkeleton } from "./sections/NotificationsSkeleton";
import { Header } from "@/components/features/layout/header";

interface NotificationsPageProps {
  initialPage?: number;
  initialPageSize?: number;
}

export const NotificationsPage = ({
  initialPage = NOTIFICATIONS_PAGINATION.DEFAULT_PAGE_NUMBER,
  initialPageSize = NOTIFICATIONS_PAGINATION.DEFAULT_PAGE_SIZE,
}: NotificationsPageProps) => {
  const t = useTranslations();
  const queryClient = useQueryClient();

  // Filter states
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Build query params
  const queryParams = useMemo(() => {
    const params: {
      pageNumber: number;
      pageSize: number;
      keyword?: string;
      status?: SystemNotificationStatus;
    } = {
      pageNumber,
      pageSize,
    };

    if (keyword.trim()) {
      params.keyword = keyword.trim();
    }

    if (statusFilter === "unread") {
      params.status = SystemNotificationStatus.New;
    } else if (statusFilter === "read") {
      params.status = SystemNotificationStatus.Read;
    }

    return params;
  }, [pageNumber, pageSize, keyword, statusFilter]);

  // Query
  const { data, isLoading, isFetching } = useGetListNotification(queryParams);
  const notifications = useMemo(() => data?.items ?? [], [data?.items]);
  const totalPages = data?.totalPages ?? 0;
  const totalItems = data?.totalItems ?? 0;

  // Mutations
  const markAsReadMutation = useMarkAsReaded();
  const markAsUnreadMutation = useMarkAsUnread();
  const hideNotificationMutation = useHideNotification();
  const markAllAsReadMutation = useMarkAllAsReaded();

  // Handlers
  const handleSearch = () => {
    setKeyword(searchInput);
    setPageNumber(1);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleStatusFilterChange = (value: "all" | "unread" | "read") => {
    setStatusFilter(value);
    setPageNumber(1);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      toast.success(t("notification_marked_as_read"));
    } catch {
      toast.error(t("something_went_wrong"));
    }
  };

  const handleMarkAsUnread = async (id: number) => {
    try {
      await markAsUnreadMutation.mutateAsync(id);
      toast.success(t("notification_marked_as_unread"));
    } catch {
      toast.error(t("something_went_wrong"));
    }
  };

  const handleHideNotification = async (id: number) => {
    try {
      await hideNotificationMutation.mutateAsync(id);
      toast.success(t("notification_hidden"));
    } catch {
      toast.error(t("something_went_wrong"));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success(t("notification_all_marked_as_read"));
    } catch {
      toast.error(t("something_went_wrong"));
    }
  };

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setKeyword("");
    setStatusFilter("all");
    setPageNumber(1);
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  };

  const hasUnreadNotifications = notifications.some(
    (n) => n.status === SystemNotificationStatus.New
  );

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-14 sm:pt-16">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header Section */}
          <NotificationsHeader
            icon={Bell}
            title={t("notifications_management")}
            description={t("notifications_description")}
            totalItems={totalItems}
            hasUnread={hasUnreadNotifications}
            onMarkAllAsRead={handleMarkAllAsRead}
            isMarkingAll={markAllAsReadMutation.isPending}
          />

          {/* Filters Section */}
          <NotificationsFilters
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchKeyDown={handleSearchKeyDown}
            onSearch={handleSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            onResetFilters={handleResetFilters}
          />

          {/* Content Section */}
          <div className="mt-6 space-y-4">
            {isLoading ? (
              <NotificationsSkeleton />
            ) : notifications.length === 0 ? (
              <NotificationsEmptyState
                hasFilters={!!keyword || statusFilter !== "all"}
                onResetFilters={handleResetFilters}
              />
            ) : (
              <>
                <NotificationsList
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAsUnread={handleMarkAsUnread}
                  onHide={handleHideNotification}
                  isMarking={markAsReadMutation.isPending || markAsUnreadMutation.isPending || hideNotificationMutation.isPending}
                  isFetching={isFetching}
                />

                <NotificationsPagination
                  pageNumber={pageNumber}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  hasPreviousPage={data?.pageIndex ? data.pageIndex > 1 : false}
                  hasNextPage={data?.pageIndex ? data.pageIndex < totalPages : false}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};
