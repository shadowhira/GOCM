"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, RefreshCw } from "lucide-react";

interface NotificationsEmptyStateProps {
  hasFilters: boolean;
  onResetFilters: () => void;
}

export const NotificationsEmptyState = ({
  hasFilters,
  onResetFilters,
}: NotificationsEmptyStateProps) => {
  const t = useTranslations();

  return (
    <Card className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {t("no_notifications")}
      </h3>
      {hasFilters ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {t("try_different_keywords")}
          </p>
          <Button variant="outline" onClick={onResetFilters} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("clear_all")}
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("notifications_description")}
        </p>
      )}
    </Card>
  );
};
