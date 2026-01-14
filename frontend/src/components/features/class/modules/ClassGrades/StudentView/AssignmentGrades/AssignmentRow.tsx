"use client";

import React, { useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import { formatDate, getScoreColor } from "./helpers";
import type { StudentAssignmentGrade } from "@/types/grade";
import {
  RewardPointRules,
  formatRewardPoints,
} from "@/config/rewardPointRules";

type TranslationValues = Record<string, string | number | Date>;

interface AssignmentRowProps {
  assignment: StudentAssignmentGrade;
  t: (key: string, options?: TranslationValues) => string;
  isHighlighted?: boolean;
}

export const AssignmentRow = ({ assignment, t, isHighlighted }: AssignmentRowProps) => {
  const rowRef = useRef<HTMLTableRowElement>(null);

  // Scroll to highlighted row
  useEffect(() => {
    if (isHighlighted && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isHighlighted]);

  return (
    <TableRow 
      ref={rowRef}
      className={cn(
        "transition-all duration-500",
        isHighlighted && "bg-primary/10 ring-2 ring-inset ring-primary animate-pulse"
      )}
    >
      <TableCell className="font-medium">{assignment.assignmentTitle}</TableCell>
      <TableCell>
        <Badge variant="outline">
          {assignment.assignmentType === "Quiz" 
            ? t("quiz") 
            : assignment.assignmentType === "Group"
            ? t("group_assignment")
            : t("essay")}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{formatDate(assignment.dueDate)}</TableCell>
      <TableCell className="text-sm">{formatDate(assignment.submittedAt)}</TableCell>
      <TableCell className="text-center">
        {assignment.normalizedScore !== null ? (
          <div className="space-y-1">
            <p className={cn("text-lg", getScoreColor(assignment.normalizedScore))}>{assignment.normalizedScore.toFixed(1)}</p>
            {assignment.normalizedScore >= RewardPointRules.thresholds.HighGradeScore && (
              <Badge variant="secondary" className="text-xs font-medium">
                {t("high_grade_bonus_badge", {
                  points: formatRewardPoints(RewardPointRules.activities.HighGradeBonus),
                })}
              </Badge>
            )}
            {/* <p className="text-xs text-muted-foreground">{assignment.score}/{assignment.maxScore}</p>
            <p className="text-xs text-muted-foreground">{assignment.percentage?.toFixed(1)}%</p> */}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-center">{<StatusBadge status={assignment.status} />}</TableCell>
      <TableCell className="max-w-xs text-sm">
        {assignment.feedback ? (
          <div className="line-clamp-2" title={assignment.feedback}>{assignment.feedback}</div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default AssignmentRow;
