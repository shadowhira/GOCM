"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useGetAssignmentById } from "@/queries/assignmentQueries";

import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

import { useUIStore } from "@/store/ui/useUIStore";
import { AssignmentType } from "@/types/constants";
import { AssignmentDetailHeader } from "./AssignmentDetailHeader";
import { AssignmentContent } from "./AssignmentContent";
import { AssignmentSubmissions } from "./AssignmentSubmissions";
import { QuizSubmission } from "./QuizSubmission";
import { AssignmentSubmission } from "./AssignmentSubmission";

interface AssignmentDetailProps {
  assignmentId: number;
  classId: number;
  isTeacher?: boolean;
}

export const AssignmentDetail = ({
  assignmentId,
  classId,
  isTeacher,
}: AssignmentDetailProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setCurrentModule } = useUIStore();

  // Extract locale from pathname (e.g., /en/class/1/assignments/2 -> en)
  const locale = pathname.split("/")[1];

  // Get page from query params
  const returnPage = searchParams.get("page") || "1";
  const editHref = `/${locale}/class/${classId}/assignments?page=${returnPage}#edit-${assignmentId}`;

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

  // Set current module for UI state
  React.useEffect(() => {
    setCurrentModule("assignment-detail");
  }, [setCurrentModule]);

  const {
    data: assignment,
    isLoading,
    error,
    refetch,
  } = useGetAssignmentById(assignmentId);

  // Note: Submission data prefetch is handled at SSR page level

  const handleEdit = () => {
    // Navigate back to assignments page with edit hash
    window.location.href = editHref;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-muted-foreground">{t("loading")}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("failed_to_load_assignment")}
        </h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : t("something_went_wrong")}
        </p>
        <Button onClick={() => refetch()} variant="outline">
          {t("try_again")}
        </Button>
      </Card>
    );
  }

  if (!assignment) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("assignment_not_found")}
        </h3>
        <p className="text-muted-foreground">
          {t("assignment_not_found_description")}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton
        href={`/${locale}/class/${classId}/assignments?page=${returnPage}`}
      />



      {/* Teacher View - Tabs */}
      {isTeacher ? (
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
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
              <span className="hidden sm:inline">{t("student_submissions_tab")}</span>
            </TabsTrigger>
          </TabsList>

          

          {/* Keep all tabs mounted, control visibility with CSS */}
          <div className={cn("mt-6 tab-content-container", activeTab !== "content" && "hidden")}>
            <div className="space-y-6">
              {/* Assignment Header */}
              <AssignmentDetailHeader
                assignment={assignment}
                onEdit={handleEdit}
                isTeacher={isTeacher}
              />
              <AssignmentContent assignment={assignment} isTeacher={isTeacher} />
            </div>  
          </div>

          <div className={cn("mt-6 tab-content-container", activeTab !== "submissions" && "hidden")}>
            <AssignmentSubmissions
              assignmentId={assignmentId}
              classId={classId}
              assignment={assignment}
            />
          </div>
        </Tabs>
      ) : (
        <>

          {/* Assignment Header */}
          <AssignmentDetailHeader
            assignment={assignment}
            onEdit={handleEdit}
            isTeacher={isTeacher}
          />
          {/* Assignment Content - For students */}
          <AssignmentContent assignment={assignment} isTeacher={isTeacher} />

          {/* Always show submission component - it handles both submission and history display */}
          {assignment.type === AssignmentType.Quiz ? (
            <QuizSubmission
              assignment={assignment}
              classId={classId}
              isTeacher={isTeacher}
              onSubmissionComplete={() => refetch()}
            />
          ) : (
            <AssignmentSubmission
              assignment={assignment}
              classId={classId}
              isTeacher={isTeacher}
              onSubmissionComplete={() => refetch()}
            />
          )}
        </>
      )}
    </div>
  );
};
