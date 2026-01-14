"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Check, Circle, EyeOff, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLocalDateTime } from "@/lib/utils";
import {
  SystemNotificationResponse,
  SystemNotificationStatus,
} from "@/types/notification";
import { getNotificationContent } from "@/lib/notifications";

interface NotificationsListProps {
  notifications: SystemNotificationResponse[];
  onMarkAsRead: (id: number) => void;
  onMarkAsUnread: (id: number) => void;
  onHide: (id: number) => void;
  isMarking: boolean;
  isFetching: boolean;
}

export const NotificationsList = ({
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onHide,
  isMarking,
  isFetching,
}: NotificationsListProps) => {
  const t = useTranslations();

  return (
    <Card className={cn(isFetching && "opacity-70")}>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-6 w-16">{t("notification_status")}</TableHead>
              <TableHead>{t("notification_content")}</TableHead>
              <TableHead className="w-40">{t("notification_time")}</TableHead>
              <TableHead className="w-32 text-right pr-6">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.map((item) => (
              <TableRow 
                key={item.id} 
                className={cn(
                  "hover:bg-muted/40",
                  // item.status === SystemNotificationStatus.New && "bg-primary-50/50 dark:bg-primary-950/20"
                )}
              >
                {/* Status */}
                <TableCell className="pl-6">
                  {item.status === SystemNotificationStatus.New ? (
                    <Badge variant="default" className="text-xs bg-primary-100 text-primary-700">
                      {t("notification_unread")}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs bg-accent-100 text-accent-700">
                      {t("notification_read")}
                    </Badge>
                  )}
                </TableCell>

                {/* Content */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={item.senderAvatarUrl} alt={item.senderName} />
                      <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                        {item.senderName?.charAt(0)?.toUpperCase() || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className={cn(
                        "text-sm",
                        item.status === SystemNotificationStatus.New
                          ? "font-medium text-foreground"
                          : "text-muted-foreground"
                      )}>
                        {getNotificationContent(t, item)}
                      </p>
                      {item.senderName && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.senderName}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Time */}
                <TableCell className="text-sm text-muted-foreground">
                  {formatLocalDateTime(item.createdAt)}
                </TableCell>

                {/* Actions */}
                <TableCell className="pr-6 text-right">
                  <div className="flex justify-end gap-1">
                    {item.linkRedirect.trim() !== "" && (
                      <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                        <Link 
                          href={item.linkRedirect} 
                          target={item.openNewTab ? "_blank" : "_self"}
                          onClick={() => {
                            if (item.status === SystemNotificationStatus.New) {
                              onMarkAsRead(item.id);
                            }
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">{t("calendar_view_detail")}</span>
                        </Link>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {item.status === SystemNotificationStatus.New ? (
                          <DropdownMenuItem 
                            onClick={() => onMarkAsRead(item.id)}
                            disabled={isMarking}
                            className="hover:bg-primary-100 hover:text-primary-700"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {t("mark_as_read")}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => onMarkAsUnread(item.id)}
                            disabled={isMarking}
                            className="hover:bg-primary-100 hover:text-primary-700"
                          >
                            <Circle className="h-4 w-4 mr-2" />
                            {t("mark_as_unread")}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onHide(item.id)}
                          disabled={isMarking}
                          className="text-destructive focus:text-destructive hover:bg-destructive/20"
                        >
                          <EyeOff className="h-4 w-4 mr-2" />
                          {t("hide_notification")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
