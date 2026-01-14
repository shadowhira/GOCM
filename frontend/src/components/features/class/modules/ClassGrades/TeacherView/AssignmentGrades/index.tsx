"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useGetAssignmentGradeSummaries } from "@/queries/gradeQueries";
import { useUrlParams } from "@/hooks/useUrlParams";
import { Pagination } from "@/components/ui/pagination";
import { ASSIGNMENT_GRADE_PAGINATION } from "@/config/pagination";
import { AssignmentGradeCard } from "./AssignmentGradeCard";
import { AssignmentGradesLoadingSkeleton } from "./AssignmentGradesLoadingSkeleton";
import { AssignmentGradesErrorState } from "./AssignmentGradesErrorState";
import { AssignmentGradesEmptyState } from "./AssignmentGradesEmptyState";
import { AssignmentGradesHeader } from "./AssignmentGradesHeader";

interface AssignmentGradesProps {
  classId: number;
}

export const AssignmentGrades = ({
  classId,
}: AssignmentGradesProps) => {
  const pathname = usePathname();
  const locale = pathname.split('/')[1];

  // Fixed constants to ensure SSR/Client synchronization
  // These MUST match the values used in SSR prefetch (page.tsx)
  const PAGE_SIZE = ASSIGNMENT_GRADE_PAGINATION.DEFAULT_PAGE_SIZE;
  const INITIAL_PAGE = ASSIGNMENT_GRADE_PAGINATION.DEFAULT_PAGE_NUMBER;

  // URL params for pagination and search
  const { params, updateParams } = useUrlParams(
    `/${locale}/class/${classId}/grades`,
    { 
      page: INITIAL_PAGE,
      search: ''
    }
  );

  const currentPage = params.page || INITIAL_PAGE;
  const searchTerm = params.search || '';

  // Local state for input value (immediate UI feedback)
  const [inputValue, setInputValue] = useState(searchTerm);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync input value with URL params when they change externally
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  // Fetch data with server-side pagination and search
  const {
    data: paginatedData,
    isLoading,
    error,
  } = useGetAssignmentGradeSummaries(classId, currentPage, PAGE_SIZE, searchTerm);

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    // Update input immediately for smooth UX
    setInputValue(value);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout to update URL params after 500ms
    debounceTimeout.current = setTimeout(() => {
      updateParams({ search: value || '', page: INITIAL_PAGE });
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage });
  };

  // Loading state
  if (isLoading) {
    return <AssignmentGradesLoadingSkeleton />;
  }

  // Error state
  if (error || !paginatedData) {
    return <AssignmentGradesErrorState />;
  }

  const { items: assignments, totalItems, totalPages } = paginatedData;

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <AssignmentGradesHeader
        totalCount={totalItems}
        searchTerm={inputValue}
        onSearchChange={handleSearchChange}
      />

      {/* Assignment Grid */}
      <div>
        {assignments.length === 0 ? (
          <AssignmentGradesEmptyState
            hasSearchTerm={!!searchTerm}
            hasFilteredResults={totalItems > 0}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {assignments.map((assignment) => (
              <AssignmentGradeCard
                key={assignment.assignmentId}
                assignment={assignment}
                classId={classId}
                locale={locale}
                currentPage={currentPage}
              />
            ))}
            
            {/* Add New Assignment Card */}
            {/* <div className="border-2 border-dashed border-neutral-300 rounded-lg flex items-center justify-center hover:border-neutral-400 transition-colors cursor-pointer min-h-[350px]">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-600">Tạo bài tập mới</p>
                <p className="text-xs text-neutral-400 mt-1">Nhấn để tạo bài tập mới cho lớp</p>
              </div>
            </div> */}
          </div>
        )}
      </div>

      {/* Pagination - Only show when more than 1 page */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          hasPreviousPage={paginatedData.hasPreviousPage}
          hasNextPage={paginatedData.hasNextPage}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          align="end"
          maxVisiblePages={5}
        />
      )}
    </div>
  );
};