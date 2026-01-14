import { useEffect } from "react";

interface UseGroupAssignmentHashNavigationProps {
  onOpenCreateGroupAssignment: () => void;
  onOpenEditGroupAssignment: (assignmentId: number) => void;
  onCloseGroupAssignment: () => void;
}

export function useGroupAssignmentHashNavigation({
  onOpenCreateGroupAssignment,
  onOpenEditGroupAssignment,
  onCloseGroupAssignment,
}: UseGroupAssignmentHashNavigationProps) {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash === "#create") {
        onOpenCreateGroupAssignment();
      } else if (hash.startsWith("#edit-")) {
        const assignmentId = parseInt(hash.replace("#edit-", ""));
        if (!isNaN(assignmentId)) {
          onOpenEditGroupAssignment(assignmentId);
        }
      } else if (!hash || hash === "#") {
        onCloseGroupAssignment();
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen to hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [onOpenCreateGroupAssignment, onOpenEditGroupAssignment, onCloseGroupAssignment]);
}
