import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  ChevronDown,
  HelpCircle,
} from "lucide-react";

interface AssignmentHeaderProps {
  classId: string;
  locale: string;
  isCreateMenuOpen: boolean;
  onCreateMenuOpenChange: (open: boolean) => void;
  onCreateEssayAssignment: () => void;
  onCreateQuizAssignment: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

export function AssignmentHeader({
  isCreateMenuOpen,
  onCreateMenuOpenChange,
  onCreateEssayAssignment,
  onCreateQuizAssignment,
  t,
}: AssignmentHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            {t("sidebar_assignments")}
          </h1>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <DropdownMenu
            open={isCreateMenuOpen}
            onOpenChange={onCreateMenuOpenChange}
          >
            <DropdownMenuTrigger asChild>
              <Button
                variant="primary"
                size="default"
                className="whitespace-nowrap"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("create_assignment")}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={onCreateEssayAssignment}>
                <Edit className="mr-2 h-4 w-4" />
                {t("create_essay_assignment")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateQuizAssignment}>
                <HelpCircle className="mr-2 h-4 w-4" />
                {t("create_quiz_assignment")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
