"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useGetStudentAverageGrades } from "@/queries/gradeQueries";
import { studentAverageGradesSchema } from "@/schemas/gradeSchema";
import { StudentAveragesHeader } from "./StudentAveragesHeader";
import { StudentGradeTableRow } from "./StudentGradeTableRow";
import { StudentAveragesLoadingSkeleton } from "./StudentAveragesLoadingSkeleton";
import { StudentAveragesErrorState } from "./StudentAveragesErrorState";
import { StudentAveragesEmptyState } from "./StudentAveragesEmptyState";
import { useClassCosmeticsBootstrap } from "@/hooks/useClassCosmeticsBootstrap";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentAveragesProps {
  classId: number;
}

export const StudentAverages = ({
  classId,
}: StudentAveragesProps) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassification, setSelectedClassification] = useState("all");
  useClassCosmeticsBootstrap(classId);

  const {
    data: rawStudentGrades,
    isLoading,
    error,
  } = useGetStudentAverageGrades(classId);

  // Validate data with schema
  const studentGrades = useMemo(() => {
    if (!rawStudentGrades) return [];
    try {
      return studentAverageGradesSchema.parse(rawStudentGrades);
    } catch (err) {
      console.error("Grade data validation failed:", err);
      return [];
    }
  }, [rawStudentGrades]);

  const getClassification = (score: number): string => {
    if (score >= 9) return "excellent";
    if (score >= 8) return "good";
    if (score >= 7) return "fair";
    if (score >= 6) return "average";
    return "poor";
  };

  const filteredStudents = useMemo(() => {
    if (!studentGrades) return [];

    return studentGrades.filter((student) => {
      // Filter by search term
      const matchesSearch =
        student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toString().includes(searchTerm);

      // Filter by classification
      const classification = getClassification(student.averageScore);
      const matchesClassification =
        selectedClassification === "all" || classification === selectedClassification;

      return matchesSearch && matchesClassification;
    });
  }, [studentGrades, searchTerm, selectedClassification]);

  // Loading state
  if (isLoading) {
    return <StudentAveragesLoadingSkeleton />;
  }

  // Error state
  if (error || !studentGrades) {
    return <StudentAveragesErrorState error={error} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <StudentAveragesHeader
        totalCount={studentGrades.length}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedClassification={selectedClassification}
        onClassificationChange={setSelectedClassification}
      />

      {/* Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-8">
            <StudentAveragesEmptyState hasSearchTerm={!!searchTerm} />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold text-foreground uppercase text-xs">
                  {t("student_column")}
                </TableHead>
                <TableHead className="font-semibold text-foreground uppercase text-xs text-center">
                  {t("average_score_column")}
                </TableHead>
                <TableHead className="font-semibold text-foreground uppercase text-xs text-center">
                  {t("submitted_column")}
                </TableHead>
                <TableHead className="font-semibold text-foreground uppercase text-xs text-center">
                  {t("graded_column")}
                </TableHead>
                <TableHead className="font-semibold text-foreground uppercase text-xs text-center">
                  {t("classification_column")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <StudentGradeTableRow
                  key={student.studentId}
                  student={student}
                  classId={classId}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};