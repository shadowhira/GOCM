import React from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  TrendingUp,
  FileText,
  CheckCircle,
  Award,
  SortAsc,
  SortDesc,
} from "lucide-react";

export type SortField = "name" | "score" | "submitted" | "graded";
export type SortDirection = "asc" | "desc";

interface SortingHeaderProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const SortingHeader = ({
  sortField,
  sortDirection,
  onSort,
}: SortingHeaderProps) => {
  const t = useTranslations();

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <SortAsc className="w-4 h-4" />
    ) : (
      <SortDesc className="w-4 h-4" />
    );
  };

  return (
    <Card className="hidden md:block">
      <CardHeader className="pb-3">
        <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground">
          <Button
            variant="ghost"
            className="justify-start h-auto p-0 hover:text-foreground"
            onClick={() => onSort("name")}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t("student_column")}
              {getSortIcon("name")}
            </div>
          </Button>

          <Button
            variant="ghost"
            className="justify-center h-auto p-0 hover:text-foreground"
            onClick={() => onSort("score")}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t("average_score_column")}
              {getSortIcon("score")}
            </div>
          </Button>

          <Button
            variant="ghost"
            className="justify-center h-auto p-0 hover:text-foreground"
            onClick={() => onSort("submitted")}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t("submitted_column")}
              {getSortIcon("submitted")}
            </div>
          </Button>

          <Button
            variant="ghost"
            className="justify-center h-auto p-0 hover:text-foreground"
            onClick={() => onSort("graded")}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {t("graded_column")}
              {getSortIcon("graded")}
            </div>
          </Button>

          <span className="flex items-center justify-center gap-2">
            <Award className="w-4 h-4" />
            {t("classification_column")}
          </span>
        </div>
      </CardHeader>
    </Card>
  );
};