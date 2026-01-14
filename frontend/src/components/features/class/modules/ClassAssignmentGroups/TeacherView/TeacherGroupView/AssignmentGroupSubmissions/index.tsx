"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  useGetSubmissionsByAssignmentAndClass,
} from "@/queries/submissionQueries";
import type { SubmissionResponse } from "@/types/submission";
import { SubmissionStatus } from "@/types/submission";
import type { AssignmentResponse } from "@/types/assignment";

// Sub-components
import { StatisticsCards } from "./StatisticsCards";
import { SearchAndFilter, type FilterStatus } from "./SearchAndFilter";
import { EmptyState } from "./EmptyState";
import { AllowShowResultToggle } from "./AllowShowResultToggle";
import { GroupSubmissionCard } from "./GroupSubmissionCard";

interface AssignmentGroupSubmissionsProps {
  assignmentId: number;
  classId: number;
  assignment?: AssignmentResponse;
}

export function AssignmentGroupSubmissions({
  assignmentId,
  classId,
  assignment,
}: AssignmentGroupSubmissionsProps) {
  const t = useTranslations();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Data fetching
  const { data } = useGetSubmissionsByAssignmentAndClass(classId, assignmentId);

  const submissions = useMemo(() => {
    return (data || []) as SubmissionResponse[];
  }, [data]);

  // Filter and search logic
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((submission) => {
      // Search filter
      const submitterName = (submission.submitByName || "").toLowerCase();
      const submitterEmail = (submission.submitByEmail || "").toLowerCase();
      const submitterIdStr = submission.submitById
        ? submission.submitById.toString()
        : "";
      const contentStr = (submission.content || "").toLowerCase();
      const filesStr = (submission.submittedFiles || [])
        .map((f) => f.fileName.toLowerCase())
        .join(" ");

      const matchesSearch =
        submitterName.includes(searchTerm.toLowerCase()) ||
        submitterEmail.includes(searchTerm.toLowerCase()) ||
        submitterIdStr.includes(searchTerm.toLowerCase()) ||
        contentStr.includes(searchTerm.toLowerCase()) ||
        filesStr.includes(searchTerm.toLowerCase());

      // Status filter
      let matchesFilter = true;
      switch (filterStatus) {
        case "submitted":
          matchesFilter = submission.status === SubmissionStatus.Submitted;
          break;
        case "graded":
          matchesFilter = submission.status === SubmissionStatus.Graded;
          break;
        case "not_submitted":
          matchesFilter = submission.status === SubmissionStatus.NotSubmitted;
          break;
        default: // "all"
          matchesFilter = true;
          break;
      }

      return matchesSearch && matchesFilter;
    });
  }, [submissions, searchTerm, filterStatus]);

  return (
    <Card className="overflow-hidden">
      {/* Header Section */}
      <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                {t("student_submissions")}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Allow Show Result Toggle */}
        {assignment && (
          <AllowShowResultToggle
            assignmentId={assignmentId}
            allowShowResultToStudent={assignment.allowShowResultToStudent}
          />
        )}

        {/* Statistics Cards */}
        <StatisticsCards submissions={submissions} t={t} />

        {/* Search and Filter Controls */}
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
          t={t}
        />

        {/* Submissions List */}
        <div className="space-y-4">
          {filteredSubmissions.length === 0 ? (
            <EmptyState t={t} />
          ) : (
            filteredSubmissions.map((submission) => (
              <GroupSubmissionCard
                key={submission.id}
                submission={submission}
                maxGrade={assignment?.maxScore || 10}
                classId={classId}
                assignmentId={assignmentId}
                t={t}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
