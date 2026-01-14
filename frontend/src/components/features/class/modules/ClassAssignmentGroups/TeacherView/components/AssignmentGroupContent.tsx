import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, FileText, AlertCircle, Users } from "lucide-react";
import type {
  PaginatedAssignmentResponse,
  AssignmentResponse,
} from "@/types/assignment";
import { cn } from "@/lib/utils";
import { AssignmentGroupList } from "./AssignmentGroupList";
import { PaginationFooter } from "../../../ClassAssignments/PaginationFooter";
import { useAssignmentPaginationHelpers } from "../../../ClassAssignments/hook/useAssignmentPaginationHelpers";

interface AssignmentGroupContentProps {
  isLoading: boolean;
  isError: boolean;
  paginated: PaginatedAssignmentResponse | undefined;
  currentPage: number;
  classId: string;
  locale: string;
  onRefetch: () => void;
  onPageChange: (page: number) => void;
  onEditAssignment: (assignmentId: number) => void;
  onDeleteAssignment: (assignment: AssignmentResponse) => void;
  t: (key: string) => string;
}

export function AssignmentGroupContent({
  isLoading,
  isError,
  paginated,
  currentPage,
  classId,
  locale,
  onRefetch,
  onPageChange,
  onEditAssignment,
  onDeleteAssignment,
  t,
}: AssignmentGroupContentProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const pageIndex = paginated?.pageNumber ?? currentPage;
  const totalPages = paginated?.totalPages ?? 1;
  const helpers = useAssignmentPaginationHelpers({
    pageIndex,
    totalPages,
    hasPreviousPage: paginated?.hasPreviousPage,
    hasNextPage: paginated?.hasNextPage,
    pageSize: paginated?.pageSize,
    totalItems: paginated?.totalCount,
  });
  const groupAssignments = paginated?.items || [];

  const handlePageChange = (page: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsAnimating(false);
    }, 220);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4 text-primary-500" />
          {t("group_assignment_list")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && !groupAssignments.length ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCcw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <AlertCircle className="h-6 w-6 text-destructive mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">
              {t("failed_to_load_assignments")}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {t("please_try_again")}
            </p>
            <Button size="sm" onClick={onRefetch}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {t("retry")}
            </Button>
          </div>
        ) : groupAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              {t("no_group_assignments_created")}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {t("create_first_group_assignment")}
            </p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "transition-all duration-200",
                isAnimating
                  ? "opacity-30 -translate-y-2"
                  : "opacity-100 translate-y-0"
              )}
            >
              <AssignmentGroupList
                groupAssignments={groupAssignments}
                classId={classId}
                locale={locale}
                currentPage={currentPage}
                onEditAssignment={onEditAssignment}
                onDeleteAssignment={onDeleteAssignment}
                t={t}
              />
            </div>
            {isLoading && groupAssignments.length > 0 && (
              <div className="px-6 py-4 text-xs text-muted-foreground">
                {t("loading_statistics")}
              </div>
            )}
            {paginated && totalPages > 1 && (
              <PaginationFooter
                page={currentPage}
                setPage={handlePageChange}
                totalPages={totalPages}
                helpers={helpers}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
