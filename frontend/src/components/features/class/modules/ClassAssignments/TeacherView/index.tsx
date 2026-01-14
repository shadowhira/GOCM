"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useGetAssignmentsByClassIdPaginated,
  useGetAssignmentFullForTeacher,
} from "@/queries/assignmentQueries";
import type { PaginatedAssignmentResponse } from "@/types/assignment";
import { useUrlParams } from "@/hooks/useUrlParams";
import { AssignmentType } from "@/types/constants";
import { ASSIGNMENT_PAGINATION } from "@/config/pagination";

// Import hooks
import { useAssignmentModals } from "./hooks/useAssignmentModals";
import { useAssignmentActions } from "./hooks/useAssignmentActions";
import { useAssignmentHashNavigation } from "./hooks/useAssignmentHashNavigation";

// Import components
import { AssignmentHeader } from "./components/AssignmentHeader";
import { AssignmentContent } from "./components/AssignmentContent";
import { AssignmentDialogs } from "./components/AssignmentDialogs";

interface TeacherViewProps {
  classId: string;
  pageSize?: number;
  initialPage?: number;
  initialSearch?: string;
}

export const TeacherView = ({
  classId,
  pageSize = ASSIGNMENT_PAGINATION.DEFAULT_PAGE_SIZE,
  initialPage = 1,
  initialSearch,
}: TeacherViewProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const numericClassId = Number(classId);

  // Extract locale from pathname (e.g., /en/class/1/assignments -> en)
  const locale = pathname.split("/")[1];

  // Use custom hook for URL parameter management
  const { params, updateParams } = useUrlParams(
    `/class/${classId}/assignments`,
    {
      page: initialPage,
      pageSize: pageSize,
      search: initialSearch,
    }
  );

  const { page: currentPage, pageSize: currentPageSize } = params;
  // Track page navigation state
  const [isNavigatingPage, setIsNavigatingPage] = useState(false);

  // Use custom hooks
  const modals = useAssignmentModals();
  // Destructure needed modal values/functions to make effect dependencies explicit
  const { editingAssignmentId, setEditingAssignment, setFormType, isFormOpen } =
    modals;

  const { data, isLoading, isError, refetch } =
    useGetAssignmentsByClassIdPaginated(numericClassId, {
      pageNumber: currentPage || 1,
      pageSize: currentPageSize || pageSize,
      excludeType: AssignmentType.Group, // Exclude Group assignments at API level
    });

  // Fetch full assignment data when editing (to get correct answers)
  const { data: fullAssignmentData } = useGetAssignmentFullForTeacher(
    numericClassId,
    editingAssignmentId || 0,
    {
      enabled: !!editingAssignmentId && isFormOpen,
    }
  );

  // Update editingAssignment when full data is loaded
  useEffect(() => {
    if (fullAssignmentData && editingAssignmentId) {
      setEditingAssignment(fullAssignmentData);
      // Also set form type based on full data
      setFormType(
        fullAssignmentData.type === AssignmentType.Quiz ? "quiz" : "essay"
      );
    }
  }, [
    fullAssignmentData,
    editingAssignmentId,
    setEditingAssignment,
    setFormType,
  ]);

  // For edit mode, only render form when full data is loaded
  const shouldShowForm =
    modals.isFormOpen &&
    (!modals.editingAssignmentId || // Create mode
      !!modals.editingAssignment); // Edit mode with data loaded

  const paginated: PaginatedAssignmentResponse | undefined = data;
  // Assignments are already filtered by API (excludeType: Group)
  const assignments = paginated?.items || [];

  // Auto navigate to previous page if current page is empty but not page 1
  useEffect(() => {
    // Only auto-navigate when we have data (not initial loading)
    if (!isLoading && paginated && data) {
      const page = currentPage || 1;
      const totalPages = paginated.totalPages || 1;

      // If current page is beyond total pages, go to last available page
      if (page > totalPages && totalPages > 0) {
        setIsNavigatingPage(true);
        updateParams({ page: totalPages });
      }
      // If current page is empty but not page 1 and there's data elsewhere
      // Only navigate if we're sure the page is actually empty (has loaded data)
      else if (
        assignments.length === 0 &&
        page > 1 &&
        paginated.totalCount > 0 &&
        paginated.totalPages > 0 &&
        page > paginated.totalPages
      ) {
        setIsNavigatingPage(true);
        updateParams({ page: page - 1 });
      } else {
        setIsNavigatingPage(false);
      }
    }
  }, [
    isLoading,
    data,
    assignments.length,
    currentPage,
    paginated,
    updateParams,
  ]);

  // Use custom hooks for actions
  const actions = useAssignmentActions({
    classId,
    currentPage: currentPage || 1,
    onDelete: modals.openDeleteConfirm,
    onCloseDeleteConfirm: modals.closeDeleteConfirm,
  });

  // Sync modal state with URL hash
  useAssignmentHashNavigation({
    assignments,
    onOpenCreateForm: modals.openCreateForm,
    onOpenEditForm: modals.openEditForm,
    onCloseForm: modals.closeForm,
    setFormType: modals.setFormType,
  });

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleCloseFormWithCleanup = () => {
    modals.closeForm();
    actions.handleCloseForm();
  };

  return (
    <div className="space-y-6">
      <AssignmentHeader
        classId={classId}
        locale={locale}
        isCreateMenuOpen={modals.isCreateMenuOpen}
        onCreateMenuOpenChange={modals.setIsCreateMenuOpen}
        onCreateEssayAssignment={() => {
          actions.handleCreateEssayAssignment();
          modals.setIsCreateMenuOpen(false);
        }}
        onCreateQuizAssignment={() => {
          actions.handleCreateQuizAssignment();
          modals.setIsCreateMenuOpen(false);
        }}
        t={t}
      />

      <AssignmentContent
        isLoading={isLoading || isNavigatingPage}
        isError={isError}
        paginated={paginated}
        currentPage={currentPage || 1}
        classId={classId}
        locale={locale}
        onRefetch={refetch}
        onPageChange={handlePageChange}
        onEditAssignment={actions.handleEditAssignment}
        onDeleteAssignment={actions.handleDeleteAssignment}
        t={t}
      />

      <AssignmentDialogs
        isFormOpen={shouldShowForm}
        formType={modals.formType}
        editingAssignment={modals.editingAssignment}
        classId={numericClassId}
        onCloseForm={handleCloseFormWithCleanup}
        onFormSuccess={handleCloseFormWithCleanup}
        transformAssignmentToFormData={actions.transformAssignmentToFormData}
        deleteConfirmOpen={modals.deleteConfirmOpen}
        assignmentToDelete={modals.assignmentToDelete}
        isDeleting={actions.deleteAssignmentMutation.isPending}
        onCancelDelete={modals.closeDeleteConfirm}
        onConfirmDelete={() =>
          actions.handleConfirmDelete(modals.assignmentToDelete)
        }
        t={t}
      />
    </div>
  );
};
