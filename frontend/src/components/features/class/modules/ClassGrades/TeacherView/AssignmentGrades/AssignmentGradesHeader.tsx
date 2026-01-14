import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface AssignmentGradesHeaderProps {
  totalCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const AssignmentGradesHeader = ({
  totalCount,
  searchTerm,
  onSearchChange,
}: AssignmentGradesHeaderProps) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {t("assignment_grades_title")}
        </h2>
        <p className="text-muted-foreground">
          {t("assignment_grades_statistics", { count: totalCount })}
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={t("search_assignments")}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};