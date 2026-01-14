"use client";

import dynamic from "next/dynamic";

function ClassGradesLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const ClassGrades = dynamic(
  () => import("./index").then((mod) => ({ default: mod.ClassGrades })),
  {
    ssr: false,
    loading: () => <ClassGradesLoading />,
  }
);

interface ClassGradesLoaderProps {
  classId: string;
  isTeacher: boolean;
}

export default function ClassGradesLoader({ classId, isTeacher }: ClassGradesLoaderProps) {
  return <ClassGrades classId={classId} isTeacher={isTeacher} />;
}
