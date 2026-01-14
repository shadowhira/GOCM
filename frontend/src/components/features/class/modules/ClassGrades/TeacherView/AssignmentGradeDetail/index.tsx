"use client";

import React, { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useGetAssignmentGradeDetails } from "@/queries/gradeQueries";
import { AssignmentGradeDetailHeader } from "./AssignmentGradeDetailHeader";
import { AssignmentStatisticsCards } from "./AssignmentStatisticsCards";
import { StudentGradeTable } from "./StudentGradeTable";
import { AssignmentGradeDetailLoadingSkeleton } from "./AssignmentGradeDetailLoadingSkeleton";
import { AssignmentGradeDetailErrorState } from "./AssignmentGradeDetailErrorState";
import { AssignmentGradeDetailNotFoundState } from "./AssignmentGradeDetailNotFoundState";

interface AssignmentGradeDetailProps {
  classId: number;
  assignmentId: number;
}

export const AssignmentGradeDetail = ({
  classId,
  assignmentId,
}: AssignmentGradeDetailProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");

  // Extract locale from pathname
  const locale = pathname.split('/')[1];
  
  // Get return parameters from query params
  const returnTab = searchParams.get('returnTab') || 'assignments';
  const returnPage = searchParams.get('page') || '1';
  
  // Build back URL with all parameters
  const backHref = `/${locale}/class/${classId}/grades?tab=${returnTab}&page=${returnPage}`;

  const {
    data: assignmentDetail,
    isLoading,
    error,
  } = useGetAssignmentGradeDetails(classId, assignmentId);

  const filteredStudents = React.useMemo(() => {
    if (!assignmentDetail?.studentGrades) return [];

    return assignmentDetail.studentGrades.filter((student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [assignmentDetail?.studentGrades, searchTerm]);

  const statistics = React.useMemo(() => {
    if (!assignmentDetail?.studentGrades) {
      return {
        totalStudents: 0,
        graded: 0,
        pending: 0,
        notSubmitted: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
      };
    }

    const students = assignmentDetail.studentGrades;
    const graded = students.filter((s) => s.status === "graded");
    const pending = students.filter((s) => s.status === "pending");
    const notSubmitted = students.filter((s) => s.status === "not_submitted");

    const scores = graded
      .map((s) => s.normalizedScore)
      .filter((score): score is number => score !== null);

    return {
      totalStudents: students.length,
      graded: graded.length,
      pending: pending.length,
      notSubmitted: notSubmitted.length,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : 0,
      lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
    };
  }, [assignmentDetail?.studentGrades]);

  // Loading state
  if (isLoading) {
    return <AssignmentGradeDetailLoadingSkeleton />;
  }

  // Error state
  if (error) {
    return <AssignmentGradeDetailErrorState error={error} />;
  }

  // Not found state
  if (!assignmentDetail) {
    return <AssignmentGradeDetailNotFoundState />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <AssignmentGradeDetailHeader
        assignmentTitle={assignmentDetail.assignmentTitle}
        assignmentType={assignmentDetail.assignmentType}
        maxScore={assignmentDetail.maxScore}
        dueDate={assignmentDetail.dueDate}
        backHref={backHref}
      />

      {/* Statistics Cards */}
      <AssignmentStatisticsCards statistics={statistics} />

      {/* Students Table */}
      <StudentGradeTable
        students={filteredStudents}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        classId={classId}
        assignmentId={assignmentId}
        assignmentType={assignmentDetail.assignmentType}
      />
    </div>
  );
};