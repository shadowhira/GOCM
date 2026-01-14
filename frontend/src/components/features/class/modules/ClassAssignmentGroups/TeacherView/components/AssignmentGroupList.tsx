import { Users } from "lucide-react";
import type { AssignmentResponse } from "@/types/assignment";
import { AssignmentGroupItem } from "./AssignmentGroupItem";

interface AssignmentGroupListProps {
  groupAssignments: AssignmentResponse[];
  classId: string;
  locale: string;
  currentPage: number;
  onEditAssignment: (assignmentId: number) => void;
  onDeleteAssignment: (assignment: AssignmentResponse) => void;
  t: (key: string) => string;
}

export function AssignmentGroupList({
  groupAssignments,
  classId,
  locale,
  currentPage,
  onEditAssignment,
  onDeleteAssignment,
  t,
}: AssignmentGroupListProps) {
  if (!groupAssignments || groupAssignments.length === 0) {
    return (
      <div className="overflow-hidden">
        {/* <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-500" />
            {t("group_assignment_list")}
          </CardTitle>
        </CardHeader> */}
        <div className="p-0">
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              {t("no_group_assignments")}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {t("no_group_assignments_description")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="p-0">
        <div className="grid gap-4 sm:gap-6">
          {groupAssignments.map((assignment) => (
            <AssignmentGroupItem
              key={assignment.id}
              assignment={assignment}
              href={`/${locale}/class/${classId}/assignment-groups/${assignment.id}?page=${currentPage}`}
              onEditAssignment={onEditAssignment}
              onDeleteAssignment={onDeleteAssignment}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
