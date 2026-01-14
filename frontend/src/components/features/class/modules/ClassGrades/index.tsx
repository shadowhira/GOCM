"use client";

import React from "react";
import { TeacherView } from "./TeacherView";
import { StudentView } from "./StudentView";

interface ClassGradesProps {
  classId: string;
  isTeacher: boolean;
}

export const ClassGrades = ({ classId, isTeacher }: ClassGradesProps) => {
  if (isTeacher) {
    return <TeacherView classId={classId} />;
  }
  return <StudentView classId={classId} />;
};