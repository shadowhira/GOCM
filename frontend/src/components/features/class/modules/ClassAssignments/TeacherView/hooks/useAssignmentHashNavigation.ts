import { useEffect } from "react";
import type { AssignmentResponse, Assignment } from "@/types/assignment";
import { AssignmentType } from "@/types/constants";

interface UseAssignmentHashNavigationProps {
  assignments: AssignmentResponse[];
  onOpenCreateForm: (type: "essay" | "quiz") => void;
  onOpenEditForm: (assignmentId: number, assignment?: Assignment) => void;
  onCloseForm: () => void;
  setFormType: (type: "essay" | "quiz") => void;
}

export function useAssignmentHashNavigation({
  assignments,
  onOpenCreateForm,
  onOpenEditForm,
  onCloseForm,
  setFormType,
}: UseAssignmentHashNavigationProps) {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === "#create-essay") {
        onOpenCreateForm("essay");
      } else if (hash === "#create-quiz") {
        onOpenCreateForm("quiz");
      } else if (hash.startsWith("#edit-")) {
        const assignmentId = parseInt(hash.replace("#edit-", ""));
        if (!isNaN(assignmentId)) {
          // Try to find assignment in current list to set form type
          const assignment = assignments.find((a) => a.id === assignmentId);
          if (assignment) {
            setFormType(
              assignment.type === AssignmentType.Quiz ? "quiz" : "essay"
            );
          }

          // Don't pass assignment from list - let it fetch from /full endpoint
          onOpenEditForm(assignmentId);
        }
      } else {
        onCloseForm();
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen to hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [assignments, onOpenCreateForm, onOpenEditForm, onCloseForm, setFormType]);
}
