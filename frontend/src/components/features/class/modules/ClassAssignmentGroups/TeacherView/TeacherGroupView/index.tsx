import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Users,
  CheckSquare,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { AssignmentDetailHeader } from "../../../ClassAssignments/AssignmentDetail/AssignmentDetailHeader";
import { GroupAssignmentContent } from "./GroupAssignmentContent";
import { ApprovalRequests } from "./ApprovalRequests";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { AssignmentResponse } from "@/types/assignment";
import { AssignmentContent } from "../../../ClassAssignments/AssignmentDetail/AssignmentContent";
import { AssignmentGroupSubmissions } from "./AssignmentGroupSubmissions";

interface TeacherGroupViewProps {
    assignmentId: number;
    classId: number;
    isTeacher?: boolean;
    assignment: AssignmentResponse;
    handleEdit: () => void;
}

export const TeacherGroupView = ({ 
    assignmentId, 
    classId, 
    isTeacher, 
    assignment, 
    handleEdit 
}: TeacherGroupViewProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use local state for instant tab switching
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get("tab") || "content";
  });

  // Handle tab change with shallow URL update (no navigation)
  const handleTabChange = useCallback((value: string) => {
    // Update state immediately for instant UI response
    setActiveTab(value);
    
    // Update URL without triggering navigation (shallow)
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  }, [pathname, searchParams]);

  // Sync state with URL if user navigates back/forward
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") || "content";
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="inline-flex h-auto w-full sm:w-auto">
        <TabsTrigger value="content" className="flex items-center gap-2 py-2 px-3 sm:px-4">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">{t("assignment_content")}</span>
        </TabsTrigger>
        <TabsTrigger
          value="submissions"
          className="flex items-center gap-2 py-2 px-3 sm:px-4"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">{t("group_submissions_tab")}</span>
        </TabsTrigger>
        <TabsTrigger value="approvals" className="flex items-center gap-2 py-2 px-3 sm:px-4">
          <CheckSquare className="w-4 h-4" />
          <span className="hidden sm:inline">{t("approval_requests_tab")}</span>
        </TabsTrigger>
      </TabsList>

      {/* Keep all tabs mounted, control visibility with CSS */}
      <div className={cn("mt-6", activeTab !== "content" && "hidden")}>
        <div className="space-y-6">
          <AssignmentDetailHeader
            assignment={assignment}
            onEdit={handleEdit}
            isTeacher={isTeacher}
          />
          <AssignmentContent assignment={assignment} isTeacher={isTeacher} />
          <GroupAssignmentContent
            assignmentId={assignmentId}
            classId={classId}
          />
        </div>
      </div>

      <div className={cn("mt-6", activeTab !== "submissions" && "hidden")}>
        <AssignmentGroupSubmissions
          assignmentId={assignmentId}
          classId={classId}
          assignment={assignment}
        />
      </div>

      <div className={cn("mt-6", activeTab !== "approvals" && "hidden")}>
        <ApprovalRequests assignmentId={assignmentId} classId={classId} />
      </div>
    </Tabs>
  );
};
