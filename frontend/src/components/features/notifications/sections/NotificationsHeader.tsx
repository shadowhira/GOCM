"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NotificationsHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  totalItems: number;
  hasUnread: boolean;
  onMarkAllAsRead: () => void;
  isMarkingAll: boolean;
}

export const NotificationsHeader = ({
  icon: Icon,
  title,
  description,
  totalItems,
  hasUnread,
  onMarkAllAsRead,
  isMarkingAll,
}: NotificationsHeaderProps) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
              {title}
            </h1>
            {totalItems > 0 ? (
              <Badge variant="secondary" className="text-xs">
                {totalItems}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {hasUnread ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onMarkAllAsRead}
          disabled={isMarkingAll}
          className="gap-2"
        >
          <CheckCheck className="h-4 w-4" />
          {t("mark_all_as_read")}
        </Button>
      ) : null}
    </div>
  );
};
