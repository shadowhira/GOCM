"use client";

import React, { useEffect, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AssignmentRow from "./AssignmentRow";
import StatusBadge from "./StatusBadge";
import { formatDate, getScoreColor } from "./helpers";
import { cn } from "@/lib/utils";
import type { StudentAssignmentGrade } from "@/types/grade";
import {
  RewardPointRules,
  formatRewardPoints,
} from "@/config/rewardPointRules";

type TranslationValues = Record<string, string | number | Date>;

interface AssignmentsTableProps {
  assignments: StudentAssignmentGrade[];
  t: (key: string, options?: TranslationValues) => string;
  highlightAssignmentId?: number | null;
}

export const AssignmentsTable = ({ assignments, t, highlightAssignmentId }: AssignmentsTableProps) => {
  const highlightRef = useRef<HTMLDivElement>(null);

  // Scroll to highlighted assignment
  useEffect(() => {
    if (highlightAssignmentId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightAssignmentId]);

  return (
    <>
      {/* Mobile Layout - Cards */}
      <div className="md:hidden space-y-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t("no_assignments_found")}
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => {
            const isHighlighted = highlightAssignmentId === assignment.assignmentId;
            return (
              <div 
                key={assignment.assignmentId} 
                ref={isHighlighted ? highlightRef : undefined}
              >
                <Card className={cn(
                  "overflow-hidden transition-all duration-500",
                  isHighlighted && "ring-2 ring-primary bg-primary/5 animate-pulse"
                )}>
                  <CardContent className="p-4 space-y-3">
                    {/* Header: Title + Type */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-foreground flex-1">{assignment.assignmentTitle}</h3>
                      <Badge variant="outline" className="flex-shrink-0">
                        {assignment.assignmentType === "Quiz" 
                          ? t("quiz") 
                          : assignment.assignmentType === "Group"
                          ? t("group_assignment")
                          : t("essay")}
                      </Badge>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t("due_date")}</div>
                        <div className="font-medium">{formatDate(assignment.dueDate)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t("submitted_at")}</div>
                        <div className="font-medium">{formatDate(assignment.submittedAt)}</div>
                      </div>
                    </div>

                    {/* Score + Status */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t("score")}</div>
                        {assignment.normalizedScore !== null ? (
                          <div className="space-y-1">
                            <div className={cn(
                              "text-2xl font-bold",
                              getScoreColor(assignment.normalizedScore)
                            )}>
                              {assignment.normalizedScore.toFixed(1)}
                            </div>
                            {assignment.normalizedScore >= RewardPointRules.thresholds.HighGradeScore && (
                              <Badge variant="secondary" className="text-xs font-medium">
                                {t("high_grade_bonus_badge", {
                                  points: formatRewardPoints(
                                    RewardPointRules.activities.HighGradeBonus
                                  ),
                                })}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                      <div>
                        <StatusBadge status={assignment.status} />
                      </div>
                    </div>

                    {/* Feedback */}
                    {assignment.feedback && (
                      <div className="pt-2 border-t">
                        <div className="text-xs text-muted-foreground mb-1">{t("feedback")}</div>
                        <div className="text-sm line-clamp-3">{assignment.feedback}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Layout - Table */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("assignment_title")}</TableHead>
              <TableHead>{t("type")}</TableHead>
              <TableHead>{t("due_date")}</TableHead>
              <TableHead>{t("submitted_at")}</TableHead>
              <TableHead className="text-center">{t("score")}</TableHead>
              <TableHead className="text-center">{t("status")}</TableHead>
              <TableHead>{t("feedback")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {t("no_assignments_found")}
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((a) => (
                <AssignmentRow 
                  key={a.assignmentId} 
                  assignment={a} 
                  t={t} 
                  isHighlighted={highlightAssignmentId === a.assignmentId}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AssignmentsTable;
