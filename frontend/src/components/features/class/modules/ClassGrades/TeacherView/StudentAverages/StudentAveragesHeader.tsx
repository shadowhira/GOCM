import React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentAveragesHeaderProps {
  totalCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedClassification: string;
  onClassificationChange: (value: string) => void;
  className?: string;
}

export const StudentAveragesHeader = ({
  totalCount,
  searchTerm,
  onSearchChange,
  selectedClassification,
  onClassificationChange,
  className,
}: StudentAveragesHeaderProps) => {
  const t = useTranslations();

  return (
    <div className={className}>
      {/* Title and Description */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          {t("student_average_grades_title")}
        </h2>
        <p className="text-muted-foreground">
          {t("student_average_grades_description", {
            count: totalCount,
          })}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder={t("search_students_placeholder")}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Classification Filter */}
        <Select value={selectedClassification} onValueChange={onClassificationChange}>
          <SelectTrigger className="w-48 h-10">
            <SelectValue placeholder={t("filter_by_classification")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("all_classifications")}</SelectItem>
            <SelectItem value="excellent">{t("grade_excellent")}</SelectItem>
            <SelectItem value="good">{t("grade_good")}</SelectItem>
            <SelectItem value="fair">{t("grade_fair")}</SelectItem>
            <SelectItem value="average">{t("grade_average")}</SelectItem>
            <SelectItem value="poor">{t("grade_poor")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};