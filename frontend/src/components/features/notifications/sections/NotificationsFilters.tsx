"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface NotificationsFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent) => void;
  onSearch: () => void;
  statusFilter: "all" | "unread" | "read";
  onStatusFilterChange: (value: "all" | "unread" | "read") => void;
  onResetFilters: () => void;
}

export const NotificationsFilters = ({
  searchInput,
  onSearchInputChange,
  onSearchKeyDown,
  onSearch,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
}: NotificationsFiltersProps) => {
  const t = useTranslations();

  const hasActiveFilters = searchInput.trim() !== "" || statusFilter !== "all";

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      {/* <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("notification_search_placeholder")}
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onKeyDown={onSearchKeyDown}
          className="pl-9 pr-10"
        />
        {searchInput ? (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={() => {
              onSearchInputChange("");
              onSearch();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div> */}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-32 sm:w-40">
            <SelectValue placeholder={t("notification_filter_by_status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("notification_all")}</SelectItem>
            <SelectItem value="unread">{t("notification_unread")}</SelectItem>
            <SelectItem value="read">{t("notification_read")}</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={onResetFilters}>
            {t("clear_all")}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
