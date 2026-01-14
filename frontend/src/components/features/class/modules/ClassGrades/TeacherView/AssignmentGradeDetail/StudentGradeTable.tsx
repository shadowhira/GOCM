import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import type { StudentGrade } from "@/types/grade";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { parseBackendDateTime } from "@/lib/utils";

interface StudentGradeTableProps {
  students: StudentGrade[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  classId: number;
  assignmentId: number;
  assignmentType?: string;
}

export const StudentGradeTable = ({
  students,
  searchTerm,
  onSearchChange,
  classId,
  assignmentId,
  assignmentType,
}: StudentGradeTableProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const isGroupAssignment = assignmentType?.toLowerCase() === "group";

  // Pre-compute submission hrefs for prefetching
  const getSubmissionHref = useMemo(() => {
    return (submissionId: number) => {
      if (isGroupAssignment) {
        return `/${locale}/class/${classId}/assignment-groups/${assignmentId}/submissions/${submissionId}`;
      }
      return `/${locale}/class/${classId}/assignments/${assignmentId}/submissions/${submissionId}`;
    };
  }, [locale, classId, assignmentId, isGroupAssignment]);

  const getStatusBadge = (status: StudentGrade["status"]) => {
    switch (status) {
      case "graded":
        return (
          <Badge
            variant="default"
            className="bg-success/10 text-success border-success/20"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t("graded")}
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="default"
            className="bg-warning/10 text-warning border-warning/20"
          >
            <Clock className="w-3 h-3 mr-1" />
            {t("pending_grading")}
          </Badge>
        );
      case "not_submitted":
        return (
          <Badge
            variant="default"
            className="bg-destructive/10 text-destructive border-destructive/20"
          >
            <XCircle className="w-3 h-3 mr-1" />
            {t("not_submitted")}
          </Badge>
        );
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 8) return "text-success font-semibold";
    if (score >= 6.5) return "text-primary font-semibold";
    if (score >= 5) return "text-warning font-semibold";
    return "text-destructive font-semibold";
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "—";
    try {
      const parsed = typeof date === 'string' 
        ? parseBackendDateTime(date) 
        : parseBackendDateTime(date.toISOString());
      if (!parsed) return t("invalid_date");
      return format(parsed, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch {
      return t("invalid_date");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>{t("student_grade_list")}</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("search_students")}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* {isGroupAssignment && (
          <Alert className="mb-4 bg-primary-50 border-primary-300">
            <Info className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <AlertDescription className="text-sm text-muted-foreground">
              <span className="font-medium text-primary-700 dark:text-primary-400">
                {t("group_assignment_note")}
              </span>
              {" "}{t("group_assignment_grading_note")}
            </AlertDescription>
          </Alert>
        )} */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#</TableHead>
                <TableHead className="text-center">{t("full_name")}</TableHead>
                <TableHead className="text-center">{t("status")}</TableHead>
                <TableHead className="text-center">{t("submission_time")}</TableHead>
                <TableHead className="text-center">{t("raw_score")}</TableHead>
                <TableHead className="text-center">{t("score_10")}</TableHead>
                <TableHead className="text-center">{t("percentage")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t("no_students_found")}
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student, index) => {
                  const canNavigate = student.submissionId && student.status !== "not_submitted";
                  const submissionHref = student.submissionId ? getSubmissionHref(student.submissionId) : null;
                  
                  return (
                    <TableRow 
                      key={student.studentId}
                      className={canNavigate ? "cursor-pointer hover:bg-muted/50 transition-colors" : "opacity-60"}
                    >
                      <TableCell className="font-medium text-center p-0">
                        {canNavigate && submissionHref ? (
                          <Link href={submissionHref} prefetch={true} className="block p-4">
                            {index + 1}
                          </Link>
                        ) : (
                          <div className="p-4">{index + 1}</div>
                        )}
                      </TableCell>
                      <TableCell className="p-0">
                        {canNavigate && submissionHref ? (
                          <Link href={submissionHref} prefetch={true} className="block p-4">
                            <div className="font-medium text-center">{student.studentName}</div>
                          </Link>
                        ) : (
                          <div className="font-medium text-center p-4">{student.studentName}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center p-0">
                        {canNavigate && submissionHref ? (
                          <Link href={submissionHref} prefetch={true} className="block p-4">
                            {getStatusBadge(student.status)}
                          </Link>
                        ) : (
                          <div className="p-4">{getStatusBadge(student.status)}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center p-0">
                        {canNavigate && submissionHref ? (
                          <Link href={submissionHref} prefetch={true} className="block p-4">
                            {formatDate(student.submittedAt)}
                          </Link>
                        ) : (
                          <div className="p-4">{formatDate(student.submittedAt)}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-center p-0">
                        {canNavigate && submissionHref ? (
                          <Link href={submissionHref} prefetch={true} className="block p-4">
                            {student.score !== null ? (
                              <span className="font-medium">{student.score.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </Link>
                        ) : (
                          <div className="p-4">
                            {student.score !== null ? (
                              <span className="font-medium">{student.score.toFixed(2)}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center p-0">
                        {canNavigate && submissionHref ? (
                          <Link href={submissionHref} prefetch={true} className="block p-4">
                            {student.normalizedScore !== null ? (
                              <span className={getScoreColor(student.normalizedScore)}>
                                {student.normalizedScore.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </Link>
                        ) : (
                          <div className="p-4">
                            {student.normalizedScore !== null ? (
                              <span className={getScoreColor(student.normalizedScore)}>
                                {student.normalizedScore.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center p-0">
                        {canNavigate && submissionHref ? (
                          <Link href={submissionHref} prefetch={true} className="block p-4">
                            {student.percentage !== null ? (
                              <span className="text-muted-foreground">
                                {student.percentage.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </Link>
                        ) : (
                          <div className="p-4">
                            {student.percentage !== null ? (
                              <span className="text-muted-foreground">
                                {student.percentage.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};