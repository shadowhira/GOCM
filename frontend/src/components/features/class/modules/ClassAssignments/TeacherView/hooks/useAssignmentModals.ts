import { useState } from "react";
import type { Assignment, AssignmentResponse } from "@/types/assignment";

export function useAssignmentModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<"essay" | "quiz">("essay");
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(
    null
  );
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(
    null
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] =
    useState<AssignmentResponse | null>(null);

  const openCreateForm = (type: "essay" | "quiz") => {
    setFormType(type);
    setIsFormOpen(true);
    setEditingAssignment(null);
    setEditingAssignmentId(null);
  };

  const openEditForm = (assignmentId: number, assignment?: Assignment) => {
    setEditingAssignmentId(assignmentId);
    if (assignment) {
      setEditingAssignment(assignment);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(null);
    setEditingAssignmentId(null);
  };

  const openDeleteConfirm = (assignment: AssignmentResponse) => {
    setAssignmentToDelete(assignment);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setAssignmentToDelete(null);
  };

  return {
    // State
    isFormOpen,
    formType,
    isCreateMenuOpen,
    editingAssignment,
    editingAssignmentId,
    deleteConfirmOpen,
    assignmentToDelete,
    // Setters
    setFormType,
    setIsCreateMenuOpen,
    setEditingAssignment,
    // Actions
    openCreateForm,
    openEditForm,
    closeForm,
    openDeleteConfirm,
    closeDeleteConfirm,
  };
}
