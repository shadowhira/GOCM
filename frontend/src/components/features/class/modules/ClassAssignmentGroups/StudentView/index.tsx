"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, FileText, AlertCircle, Users } from "lucide-react";
import { useGetAssignmentsByClassIdPaginated } from "@/queries/assignmentQueries";
import type {
  PaginatedAssignmentResponse,
} from "@/types/assignment";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUrlParams } from "@/hooks/useUrlParams";
import { AssignmentType } from "@/types/constants";

import { AssignmentListItem } from "../../ClassAssignments/AssignmentListItem";
import { AssignmentListSkeleton } from "../../ClassAssignments/AssignmentListSkeleton";
import { PaginationFooter } from "../../ClassAssignments/PaginationFooter";

import { ASSIGNMENT_PAGINATION } from "@/config/pagination";
import { useAssignmentPaginationHelpers } from "../../ClassAssignments/hook/useAssignmentPaginationHelpers";

interface StudentViewProps {
  classId: string;
  pageSize?: number;
  initialPage?: number;
  initialSearch?: string;
}

export const StudentView = ({
  classId,
  pageSize = ASSIGNMENT_PAGINATION.DEFAULT_PAGE_SIZE,
  initialPage = 1,
  initialSearch,
}: StudentViewProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const numericClassId = Number(classId);

  const { params, updateParams } = useUrlParams(
    `/class/${classId}/assignment-groups`,
    {
      page: initialPage,
      pageSize: pageSize,
      search: initialSearch,
    }
  );

  const { page: currentPage, pageSize: currentPageSize } = params;

  // Filter only Group type assignments
  const { data, isLoading, isError, refetch } =
    useGetAssignmentsByClassIdPaginated(numericClassId, {
      pageNumber: currentPage || 1,
      pageSize: currentPageSize || pageSize,
      type: AssignmentType.Group, // Only fetch Group assignments
    });

  const paginated: PaginatedAssignmentResponse | undefined = data;
  
  // Backend already filters by Group type
  const groupAssignments = paginated?.items || [];
  

  const pageIndex = paginated?.pageNumber ?? (currentPage || 1);
  const totalPages = paginated?.totalPages ?? 1;
  const helpers = useAssignmentPaginationHelpers({
    pageIndex,
    totalPages,
    hasPreviousPage: paginated?.hasPreviousPage,
    hasNextPage: paginated?.hasNextPage,
    pageSize: paginated?.pageSize,
    totalItems: paginated?.totalCount,
  });

  const [isAnimating, setIsAnimating] = useState(false);

  const handlePageChange = (page: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      updateParams({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsAnimating(false);
    }, 220);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {t("group_assignments")}
          </h1>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-500" />
            {t("group_assignment_list")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && !groupAssignments.length ? (
            <AssignmentListSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <AlertCircle className="h-6 w-6 text-destructive mb-2" />
              <p className="text-sm font-medium text-foreground mb-1">
                {t("failed_to_load_assignments")}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {t("please_try_again")}
              </p>
              <Button size="sm" onClick={() => refetch()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {t("retry")}
              </Button>
            </div>
          ) : groupAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                {t("no_group_assignments_available")}
              </p>
              {/* <p className="text-xs text-muted-foreground mb-4">
                {t("check_back_later")}
              </p> */}
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
                <div className="grid gap-4 sm:gap-6">
                  {groupAssignments.map((a) => (
                    <AssignmentListItem
                      key={a.id}
                      assignment={a}
                      href={`/${locale}/class/${classId}/assignment-groups/${a.id}?page=${currentPage}`}
                      isTeacher={false}
                    />
                  ))}
                </div>
              </div>
              {isLoading && groupAssignments.length > 0 && (
                <div className="px-6 py-4 text-xs text-muted-foreground">
                  {t("loading_statistics")}
                </div>
              )}
              {paginated && totalPages > 1 && (
                <PaginationFooter
                  page={currentPage || 1}
                  setPage={handlePageChange}
                  totalPages={totalPages}
                  helpers={helpers}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
