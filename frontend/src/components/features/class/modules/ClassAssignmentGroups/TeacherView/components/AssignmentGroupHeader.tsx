import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AssignmentGroupHeaderProps {
  classId: string;
  locale: string;
  onCreateGroupAssignment: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export function AssignmentGroupHeader({
  onCreateGroupAssignment,
  t,
}: AssignmentGroupHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {t("group_assignments")}
          </h1>
          {/* <p className="text-muted-foreground text-sm">
            {t("group_assignments_description")}
          </p> */}
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <Button
            variant="primary"
            size="default"
            className="whitespace-nowrap"
            onClick={onCreateGroupAssignment}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("create_group_assignment")}
          </Button>
        </div>
      </div>
    </div>
  );
}
