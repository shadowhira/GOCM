import { useRouter } from "next/navigation";
import type { Assignment, AssignmentResponse } from "@/types/assignment";
import { useDeleteAssignment } from "@/queries/assignmentQueries";
import { parseBackendDateTime } from "@/lib/utils";

interface UseAssignmentActionsProps {
  classId: string;
  currentPage: number;
  onDelete: (assignment: AssignmentResponse) => void;
  onCloseDeleteConfirm: () => void;
}

export function useAssignmentActions({
  classId,
  currentPage,
  onDelete,
  onCloseDeleteConfirm,
}: UseAssignmentActionsProps) {
  const router = useRouter();
  const deleteAssignmentMutation = useDeleteAssignment();

  const handleCreateEssayAssignment = () => {
    window.location.hash = "create-essay";
  };

  const handleCreateQuizAssignment = () => {
    window.location.hash = "create-quiz";
  };

  const handleViewAssignment = (assignment: AssignmentResponse) => {
    const currentPath = window.location.pathname;
    const locale = currentPath.split("/")[1];
    router.push(
      `/${locale}/class/${classId}/assignments/${assignment.id}?page=${currentPage}`
    );
  };

  const handleEditAssignment = (assignment: AssignmentResponse) => {
    window.location.hash = `edit-${assignment.id}`;
  };

  const handleDeleteAssignment = (assignment: AssignmentResponse) => {
    onDelete(assignment);
  };

  const handleConfirmDelete = async (
    assignmentToDelete: AssignmentResponse | null
  ) => {
    if (!assignmentToDelete) return;

    try {
      await deleteAssignmentMutation.mutateAsync(assignmentToDelete.id);
      onCloseDeleteConfirm();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleCloseForm = () => {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  };

  const transformAssignmentToFormData = (assignment: Assignment) => {
    console.log(
      "[transformAssignmentToFormData] Input assignment:",
      assignment
    );

    const formData = {
      id: assignment.id!,
      title: assignment.title,
      content: assignment.content || "",
      deadline: parseBackendDateTime(String(assignment.deadline)) || new Date(assignment.deadline),
      maxScore: assignment.maxScore,
      type: assignment.type,
      attachedDocumentIds: assignment.attachments?.map((att) => att.id) || [],
      listQuestions: assignment.listQuestions?.map((q) => {
        return {
          id: q.id!,
          questionText: q.questionText,
          questionType: q.questionType,
          point: q.point,
          options:
            q.options?.map((opt) => {
              return {
                id: opt.id!,
                optionText: opt.optionText,
                isCorrect: opt.isCorrect ?? false,
              };
            }) || [],
        };
      }),
      allowShowResultToStudent: assignment.allowShowResultToStudent
    };

    console.log("[transformAssignmentToFormData] Output formData:", formData);
    return formData;
  };

  return {
    deleteAssignmentMutation,
    handleCreateEssayAssignment,
    handleCreateQuizAssignment,
    handleViewAssignment,
    handleEditAssignment,
    handleDeleteAssignment,
    handleConfirmDelete,
    handleCloseForm,
    transformAssignmentToFormData,
  };
}
