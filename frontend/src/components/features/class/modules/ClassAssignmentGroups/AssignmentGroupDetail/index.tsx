"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useGetAssignmentById } from "@/queries/assignmentQueries";

import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle, Edit } from "lucide-react";

import { useUIStore } from "@/store/ui/useUIStore";
import { AssignmentDetailHeader } from "../../ClassAssignments/AssignmentDetail/AssignmentDetailHeader";
import { AssignmentContent } from "../../ClassAssignments/AssignmentDetail/AssignmentContent";

import { StudentGroupView } from "../StudentView/StudentGroupView";
import { TeacherGroupView } from "../TeacherView/TeacherGroupView";

interface AssignmentGroupDetailProps {
  assignmentId: number;
  classId: number;
  isTeacher?: boolean;
}

export const AssignmentGroupDetail = ({
  assignmentId,
  classId,
  isTeacher,
}: AssignmentGroupDetailProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setCurrentModule } = useUIStore();

  const locale = pathname.split("/")[1];
  const returnPage = searchParams.get("page") || "1";
  const editHref = `/${locale}/class/${classId}/assignment-groups?page=${returnPage}#edit-${assignmentId}`;

  React.useEffect(() => {
    setCurrentModule("assignment-group-detail");
  }, [setCurrentModule]);

  const {
    data: assignment,
    isLoading,
    error,
    refetch,
  } = useGetAssignmentById(assignmentId);

  const handleEdit = () => {
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
      <BackButton
        href={`/${locale}/class/${classId}/assignment-groups?page=${returnPage}`}
      />

      {isTeacher ? (
        <TeacherGroupView
          assignmentId={assignmentId}
          classId={classId}
          isTeacher={isTeacher}
          assignment={assignment}
          handleEdit={handleEdit}
        />
      ) : (
        <>
          <AssignmentDetailHeader
            assignment={assignment}
            onEdit={handleEdit}
            isTeacher={isTeacher}
          />
          <AssignmentContent assignment={assignment} isTeacher={isTeacher} />
          <StudentGroupView classId={classId} assignmentId={assignmentId} />
        </>
      )}
    </div>
  );
};
