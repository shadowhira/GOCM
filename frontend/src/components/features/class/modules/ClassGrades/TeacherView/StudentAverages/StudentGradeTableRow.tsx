import React from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StudentAverageGrade } from "@/types/grade";
import { CosmeticAvatar } from "@/components/features/cosmetics";

interface StudentGradeTableRowProps {
  student: StudentAverageGrade;
  classId: number;
}

export const StudentGradeTableRow = ({
  student,
  classId,
}: StudentGradeTableRowProps) => {
  const t = useTranslations();

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 80) return "text-info";
    if (score >= 70) return "text-warning";
    if (score >= 60) return "text-warning";
    return "text-error";
  };

  const getGradeStatus = (score: number) => {
    if (score >= 9)
      return {
        label: t("grade_excellent"),
        color: "bg-success/10 text-success border-success/20",
      };
    if (score >= 8)
      return {
        label: t("grade_good"),
        color: "bg-info/10 text-info border-info/20",
      };
    if (score >= 7)
      return {
        label: t("grade_fair"),
        color: "bg-warning/10 text-warning border-warning/20",
      };
    if (score >= 6)
      return {
        label: t("grade_average"),
        color: "bg-warning/10 text-warning border-warning/20",
      };
    return {
      label: t("grade_poor"),
      color: "bg-error/10 text-error border-error/20",
    };
  };

  const status = getGradeStatus(student.averageScore);

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      {/* Student Info */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <CosmeticAvatar
            classId={classId}
            classMemberId={student.studentId}
            avatarUrl={student.studentAvatarUrl}
            displayName={student.studentName || t("unknown")}
            size="sm"
          />
          <div className="font-semibold text-foreground truncate">
            {student.studentName ||
              `${t("student_id_prefix")}${student.studentId}`}
          </div>
        </div>
      </td>

      {/* Average Score */}
      <td className="py-4 px-4 text-center">
        <div
          className={cn(
            "text-2xl font-bold",
            getGradeColor(student.averageScore)
          )}
        >
          {student.averageScore.toFixed(1)} / 10
        </div>
      </td>

      {/* Submitted Count */}
      <td className="py-4 px-4 text-center">
        <div className="text-lg font-semibold text-foreground">
          {student.submittedCount}/{student.totalAssignments}
        </div>
      </td>

      {/* Graded Count */}
      <td className="py-4 px-4 text-center">
        <div className="text-lg font-semibold text-foreground">
          {student.gradedCount}/{student.submittedCount}
        </div>
      </td>

      {/* Status Badge */}
      <td className="py-4 px-4">
        <div className="flex justify-center">
          <Badge className={status.color}>{status.label}</Badge>
        </div>
      </td>
    </tr>
  );
};
