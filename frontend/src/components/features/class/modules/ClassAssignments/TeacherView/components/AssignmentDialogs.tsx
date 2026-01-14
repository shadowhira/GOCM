import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Assignment, AssignmentResponse } from "@/types/assignment";

import { CreateAssignmentForm, CreateQuizWithModesForm } from "../forms/export";

interface AssignmentDialogsProps {
  // Form Dialog
  isFormOpen: boolean;
  formType: "essay" | "quiz";
  editingAssignment: Assignment | null;
  classId: number;
  onCloseForm: () => void;
  onFormSuccess: () => void;
  transformAssignmentToFormData: (assignment: Assignment) => {
    id: number;
    title: string;
    content: string;
    deadline: Date;
    maxScore: number;
    type: number;
    attachedDocumentIds: number[];
    listQuestions?: Array<{
      id: number;
      questionText: string;
      questionType: number;
      point: number;
      options: Array<{
        id: number;
        optionText: string;
        isCorrect: boolean;
      }>;
    }>;
    allowShowResultToStudent: boolean;
  };

  // Delete Confirmation Dialog
  deleteConfirmOpen: boolean;
  assignmentToDelete: AssignmentResponse | null;
  isDeleting: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;

  t: (key: string, params?: Record<string, string>) => string;
}

export function AssignmentDialogs({
  isFormOpen,
  formType,
  editingAssignment,
  classId,
  onCloseForm,
  onFormSuccess,
  transformAssignmentToFormData,
  deleteConfirmOpen,
  assignmentToDelete,
  isDeleting,
  onCancelDelete,
  onConfirmDelete,
  t,
}: AssignmentDialogsProps) {
  return (
    <>
      {/* Assignment Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && onCloseForm()}>
        <DialogContent className="max-w-6xl h-modal overflow-y-auto hide-scrollbar">
          <DialogHeader>
            <DialogTitle>
              {editingAssignment
                ? t("edit_assignment")
                : formType === "essay"
                ? t("create_essay_assignment")
                : t("create_quiz_assignment")}
            </DialogTitle>
          </DialogHeader>
          {formType === "essay" ? (
            <CreateAssignmentForm
              mode={editingAssignment ? "edit" : "create"}
              classId={classId}
              initialData={
                editingAssignment
                  ? transformAssignmentToFormData(editingAssignment)
                  : undefined
              }
              editingAssignment={editingAssignment}
              onSuccess={onFormSuccess}
              onCancel={onCloseForm}
            />
          ) : (
            <CreateQuizWithModesForm
              mode={editingAssignment ? "edit" : "create"}
              classId={classId}
              initialData={
                editingAssignment
                  ? transformAssignmentToFormData(editingAssignment)
                  : undefined
              }
              onSuccess={onFormSuccess}
              onCancel={onCloseForm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={onCancelDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("delete")} {t("assignment")}
            </DialogTitle>
            <DialogDescription>
              {t("delete_assignment_confirmation", {
                title: assignmentToDelete?.title || "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={onCancelDelete}
              disabled={isDeleting}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                t("delete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
