/* eslint-disable design-system/no-hardcoded-colors */
"use client";

import { useState } from "react";

import { BellIcon, CircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { RoomNotification } from "@/types/liveRoom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatLocalDateTime } from "@/lib/utils";
import { useTranslations } from "next-intl";
type RoomNotificationProps = {
  notifications: RoomNotification[];
  clearNotifications: () => void;
};

export const RoomNotifications = ({
  notifications,
  clearNotifications,
}: RoomNotificationProps) => {
  const t = useTranslations();
  const [readMessagesSet, setReadMessagesSet] = useState<Set<string>>(new Set());

  const markAsRead = (id: string) => {
    setReadMessagesSet(prev => new Set(prev).add(id));
  };

  const markAllAsRead = () => {
    setReadMessagesSet(new Set(notifications.map(e => e.id)));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="lk-button relative"
          aria-label={t('live_room_notifications_label')}
          title={t('live_room_notifications_label')}
        >
          <BellIcon />
          <span className="sr-only">{t("live_room_notifications_label")}</span>

          {/* Badge thông báo */}
          {notifications.some(noti => !readMessagesSet.has(noti.id)) && (
            <span className='absolute top-0 right-0 size-2 animate-bounce rounded-full bg-sky-600 dark:bg-sky-400' />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-100 p-0">
        <div className="grid">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5">
            <span className="font-medium">{t("live_room_notifications_label")}</span>
            <div className="flex gap-2">
              <Button
                className="h-7 px-2 py-1 text-xs"
                onClick={clearNotifications}
              >
                {t("live_room_notifications_clear_all")}
              </Button>
              <Button
                className="h-7 px-2 py-1 text-xs"
                onClick={markAllAsRead}
              >
                {t("live_room_notifications_mark_all_read")}
              </Button>
            </div>
          </div>
          <Separator className="" />
          <ScrollArea className="rounded-md h-100">
            <ul className="grid gap-4 p-2">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className="hover:bg-accent flex items-start gap-2 rounded-lg px-2 py-1.5"
                  onClick={() => markAsRead(item.id)}
                >
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-medium">
                      {item.notification}
                    </div>
                    <p className="text-muted-foreground text-xs">{formatLocalDateTime(item.createdAt)}</p>
                  </div>
                  {!readMessagesSet.has(item.id) && (
                    <CircleIcon className="fill-primary text-primary size-2 self-center" />
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
};
