"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import {
  useGetAssignmentsByClassIdPaginated,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useGetAssignmentFullForTeacher,
} from "@/queries/assignmentQueries";
import { AssignmentType } from "@/types/constants";
import type { AssignmentResponse } from "@/types/assignment";
import { ASSIGNMENT_PAGINATION } from "@/config/pagination";
import { parseBackendDateTime } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import components
import { AssignmentGroupHeader } from "./components/AssignmentGroupHeader";
import { AssignmentGroupContent } from "./components/AssignmentGroupContent";
import { CreateGroupAssignmentDialog } from "./components/CreateGroupAssignmentDialog";
import type { CreateGroupAssignmentFormData } from "@/schemas/assignmentGroupSchema";
import { useGroupAssignmentHashNavigation } from "./hooks/useGroupAssignmentHashNavigation";
import { useUrlParams } from "@/hooks/useUrlParams";

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
  const locale = pathname.split("/")[1];
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<AssignmentResponse | null>(null);

  const { params, updateParams } = useUrlParams(
      `/class/${classId}/assignment-groups`,
      {
        page: initialPage,
        pageSize: pageSize,
        search: initialSearch,
      }
    );
  
    const { page: currentPage, pageSize: currentPageSize } = params;

  // Use paginated query with Group type filter
  const { data, isLoading, isError, refetch } = useGetAssignmentsByClassIdPaginated(
    Number(classId),
    {
      pageNumber: currentPage || 1,
      pageSize: currentPageSize || pageSize,
      type: AssignmentType.Group, 
    }
  );

  const createAssignmentMutation = useCreateAssignment();
  const updateAssignmentMutation = useUpdateAssignment();
  const deleteAssignmentMutation = useDeleteAssignment();

  // Fetch full assignment data when editing
  const { data: fullAssignmentData } = useGetAssignmentFullForTeacher(
    Number(classId),
    editingAssignmentId || 0,
    {
      enabled: !!editingAssignmentId && isCreateDialogOpen,
    }
  );

  const handleCreateGroupAssignment = () => {
    setEditingAssignmentId(null);
    setIsCreateDialogOpen(true);
    window.location.hash = "#create";
  };

  const handleEditAssignment = (assignmentId: number) => {
    setEditingAssignmentId(assignmentId);
    setIsCreateDialogOpen(true);
    window.location.hash = `#edit-${assignmentId}`;
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingAssignmentId(null);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  // Hash navigation
  useGroupAssignmentHashNavigation({
    onOpenCreateGroupAssignment: () => {
      setEditingAssignmentId(null);
      setIsCreateDialogOpen(true);
    },
    onOpenEditGroupAssignment: (assignmentId) => {
      setEditingAssignmentId(assignmentId);
      setIsCreateDialogOpen(true);
    },
    onCloseGroupAssignment: () => {
      setIsCreateDialogOpen(false);
      setEditingAssignmentId(null);
    },
  });

  const handleDeleteAssignment = (assignment: AssignmentResponse) => {
    setAssignmentToDelete(assignment);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await deleteAssignmentMutation.mutateAsync(assignmentToDelete.id);
      setDeleteConfirmOpen(false);
      setAssignmentToDelete(null);
    } catch {
      // Error handled by mutation error handling
    }
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleSubmitGroupAssignment = async (data: CreateGroupAssignmentFormData) => {
    try {
      const transformedData = {
        ...data,
        type: AssignmentType.Group,
        listQuestions: [],
      };

      if (editingAssignmentId) {
        await updateAssignmentMutation.mutateAsync({
          classId: Number(classId),
          assignmentId: editingAssignmentId,
          data: transformedData,
        });
      } else {
        await createAssignmentMutation.mutateAsync({
          classId: Number(classId),
          data: transformedData,
        });
      }
      
      // Close dialog and cleanup
      handleCloseDialog();
    } catch {
      // Error handled by mutation error handling
      // Don't close dialog on error so user can see the error and retry
    }
  };

  // Prepare initial data for edit form
  const initialData = React.useMemo(() => {
    if (!fullAssignmentData || !editingAssignmentId) return undefined;
    
    return {
      id: fullAssignmentData.id,
      title: fullAssignmentData.title,
      content: fullAssignmentData.content,
      deadline: parseBackendDateTime(String(fullAssignmentData.deadline)) || new Date(fullAssignmentData.deadline),
      maxScore: fullAssignmentData.maxScore,
      attachedDocumentIds: fullAssignmentData.attachments?.map(a => a.id) || [],
    };
  }, [fullAssignmentData, editingAssignmentId]);

  const initialAttachments = React.useMemo(() => {
    if (!fullAssignmentData || !editingAssignmentId) return undefined;
    return fullAssignmentData.attachments;
  }, [fullAssignmentData, editingAssignmentId]);

  const isSubmitting = createAssignmentMutation.isPending || updateAssignmentMutation.isPending;

  return (
    <div className="space-y-6">
      <AssignmentGroupHeader
        classId={classId}
        locale={locale}
        onCreateGroupAssignment={handleCreateGroupAssignment}
        t={t}
      />

      <AssignmentGroupContent
        isLoading={isLoading}
        isError={isError}
        paginated={data}
        currentPage={currentPage || 1}
        classId={classId}
        locale={locale}
        onRefetch={refetch}
        onPageChange={handlePageChange}
        onEditAssignment={handleEditAssignment}
        onDeleteAssignment={handleDeleteAssignment}
        t={t}
      />

      <CreateGroupAssignmentDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
        onSubmit={handleSubmitGroupAssignment}
        isSubmitting={isSubmitting}
        classId={classId}
        t={t}
        initialData={initialData}
        initialAttachments={initialAttachments}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete")} {t("assignment")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete_assignment_confirmation", {
                title: assignmentToDelete?.title || "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAssignmentMutation.isPending}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteAssignmentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAssignmentMutation.isPending ? t("deleting") : t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
