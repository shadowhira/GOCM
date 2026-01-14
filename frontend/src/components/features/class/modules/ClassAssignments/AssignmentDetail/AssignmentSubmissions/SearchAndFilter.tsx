import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

type FilterStatus = "all" | "submitted" | "graded" | "not_submitted";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (value: FilterStatus) => void;
  t: (key: string) => string;
}

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "all_status" },
  { value: "submitted", label: "submitted" },
  { value: "graded", label: "graded" },
  { value: "not_submitted", label: "not_submitted" },
];

export function SearchAndFilter({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  t,
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-muted/20 rounded-lg">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("search_students")}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-10 bg-background border-border/50 focus:border-primary"
        />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">{t("filter")}:</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value as FilterStatus)}
          className="h-10 px-3 py-2 border border-border/50 rounded-md bg-background text-foreground text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 flex-1 sm:flex-none sm:w-44"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export type { FilterStatus };
