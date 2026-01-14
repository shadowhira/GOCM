"use client";

import { Bell, CircleIcon, MoreVertical, Check, Circle, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  useGetTopNotifications,
  useMarkAsReaded,
  useMarkAsUnread,
  useHideNotification,
  useMarkAllAsReaded,
} from "@/queries/notificationQueries";
import { formatLocalDateTime } from "@/lib/utils";
import {
  SystemNotificationResponse,
  SystemNotificationStatus,
} from "@/types/notification";
import { useRouterWithProgress } from "@/hooks/useRouterWithProgress";
import { cn } from "@/lib/utils";
import { getNotificationContent } from "@/lib/notifications";

interface NotificationProps {
  isReceivedNewNoti: boolean;
  setIsReceivedNewNoti: (val: boolean) => void;
}

const Notifications = ({
  isReceivedNewNoti,
  setIsReceivedNewNoti,
}: NotificationProps) => {
  const t = useTranslations();
  const router = useRouterWithProgress();
  const { data: notifications } = useGetTopNotifications({
    top: 10,
  });
  const markAsReaded = useMarkAsReaded();
  const markAsUnread = useMarkAsUnread();
  const hideNotification = useHideNotification();
  const markAllAsReaded = useMarkAllAsReaded();

  const unreadCount = (notifications ?? []).filter(
    (n) => n.status === SystemNotificationStatus.New
  ).length;

  const hasUnreadNotifications = unreadCount > 0;

  const onClickNotification = async (item: SystemNotificationResponse) => {
    if (item.status === SystemNotificationStatus.New) {
      await markAsReaded.mutateAsync(item.id);
    }

    if (item.linkRedirect.trim() !== "") {
      if (item.openNewTab) {
        window.open(item.linkRedirect, "_blank");
      } else {
        window.open(item.linkRedirect, "_self");
      }
    }
  };

  const onMarkAsRead = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await markAsReaded.mutateAsync(id);
  };

  const onMarkAsUnread = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await markAsUnread.mutateAsync(id);
  };

  const onHideNotification = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await hideNotification.mutateAsync(id);
  };

  const onMarkAllAsRead = async () => {
    await markAllAsReaded.mutateAsync();
  };

  const onViewAll = () => {
    router.push("/notifications");
  };

  const openHandler = (open: boolean) => {
    if (open) {
      setIsReceivedNewNoti(false);
    }
  };

  return (
    <Popover onOpenChange={openHandler}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 sm:p-1.5 relative shrink-0 text-foreground hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
          aria-label={t("notifications")}
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
          {(isReceivedNewNoti || unreadCount > 0) && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-medium bg-destructive text-destructive-foreground rounded-full px-1">
              {unreadCount > 9 ? "9+" : unreadCount || "•"}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="grid">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{t("notifications")}</span>
              {unreadCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({unreadCount} {t("notification_unread").toLowerCase()})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {hasUnreadNotifications && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-primary-700 hover:bg-primary-50 border border-border transition-colors"
                  onClick={onMarkAllAsRead}
                  disabled={markAllAsReaded.isPending}
                >
                  {t("mark_all_as_read")}
                </Button>
              )}
            </div>
          </div>
          <Separator />

          {/* Notification List */}
          <ul className="max-h-80 overflow-y-auto">
            {(notifications ?? []).length === 0 ? (
              <li className="px-4 py-8 text-center text-muted-foreground text-sm">
                {t("no_notifications")}
              </li>
            ) : (
              (notifications ?? []).map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors group",
                    "hover:bg-primary-100/10 hover:text-primary-400 hover:dark:bg-primary-300/10",
                  )}
                  onClick={() => onClickNotification(item)}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                      src={item.senderAvatarUrl}
                      alt={item.senderName}
                    />
                    <AvatarFallback className="text-xs bg-primary-100 text-primary-700">
                      {item.senderName?.charAt(0)?.toUpperCase() || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className={cn(
                      "text-sm leading-snug overflow-wrap-break-word",
                      item.status === SystemNotificationStatus.New
                        ? "font-medium"
                        : ""
                    )}>
                      {getNotificationContent(t, item)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatLocalDateTime(item.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === SystemNotificationStatus.New && (
                      <CircleIcon className="h-2 w-2 fill-primary text-primary bg-primary-500 rounded-full" />
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {item.status === SystemNotificationStatus.New ? (
                          <DropdownMenuItem className="hover:bg-primary-100 hover:text-primary-700" onClick={(e) => onMarkAsRead(e, item.id)}>
                            <Check className="h-4 w-4 mr-2" />
                            {t("mark_as_read")}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="hover:bg-primary-100 hover:text-primary-700" onClick={(e) => onMarkAsUnread(e, item.id)}>
                            <Circle className="h-4 w-4 mr-2" />
                            {t("mark_as_unread")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => onHideNotification(e, item.id)}
                          className="text-destructive focus:text-destructive hover:bg-destructive/20"
                        >
                          <EyeOff className="h-4 w-4 mr-2" />
                          {t("hide_notification")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          {(notifications ?? []).length > 0 && (
            <>
              <Separator />
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-9 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                  onClick={onViewAll}
                >
                  {t("view_all_notifications")}
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;

