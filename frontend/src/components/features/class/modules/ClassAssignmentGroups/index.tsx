"use client";

import React from "react";
import { TeacherView } from "./TeacherView";
import { StudentView } from "./StudentView";

interface ClassAssignmentGroupsProps {
  classId: string;
  pageSize?: number;
  initialPage?: number;
  initialSearch?: string;
  isTeacher?: boolean;
}

export const ClassAssignmentGroups = ({
  classId,
  pageSize,
  initialPage,
  initialSearch,
  isTeacher = false,
}: ClassAssignmentGroupsProps) => {
  if (isTeacher) {
    return (
      <TeacherView
        classId={classId}
        pageSize={pageSize}
        initialPage={initialPage}
        initialSearch={initialSearch}
      />
    );
  }

  return (
    <StudentView
      classId={classId}
      pageSize={pageSize}
      initialPage={initialPage}
      initialSearch={initialSearch}
    />
  );
};
