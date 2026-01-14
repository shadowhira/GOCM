"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useGetMyGrades } from "@/queries/gradeQueries";
import { AssignmentGradesLoadingSkeleton } from "./AssignmentGradesLoadingSkeleton";
import { AssignmentGradesErrorState } from "./AssignmentGradesErrorState";
import SummaryCard from "./SummaryCard";
import AssignmentsTable from "./AssignmentsTable";
import type { StudentGradesSummary } from "@/types/grade";

interface AssignmentGradesProps {
  classId: number;
  highlightAssignmentId?: number | null;
}

export const AssignmentGrades = ({ classId, highlightAssignmentId }: AssignmentGradesProps) => {
  const t = useTranslations();

  const { data: gradesData, isLoading, error } = useGetMyGrades(classId);

  if (isLoading) return <AssignmentGradesLoadingSkeleton />;
  if (error || !gradesData) return <AssignmentGradesErrorState />;

  const summary: Pick<
    StudentGradesSummary,
    | "averageScore"
    | "averagePercentage"
    | "totalAssignments"
    | "gradedCount"
    | "pendingCount"
    | "notSubmittedCount"
  > = {
    averageScore: gradesData.averageScore,
    averagePercentage: gradesData.averagePercentage,
    totalAssignments: gradesData.totalAssignments,
    gradedCount: gradesData.gradedCount,
    pendingCount: gradesData.pendingCount,
    notSubmittedCount: gradesData.notSubmittedCount,
  };

  return (
    <div className="space-y-6">
      <SummaryCard summary={summary} t={t} />
      <div>
        <h2 className="sr-only">{t("assignment_grades_detail")}</h2>
        <AssignmentsTable 
          assignments={gradesData.assignments} 
          t={t} 
          highlightAssignmentId={highlightAssignmentId}
        />
      </div>
    </div>
  );
};

export default AssignmentGrades;