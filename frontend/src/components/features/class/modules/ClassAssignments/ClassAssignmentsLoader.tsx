"use client";

import dynamic from "next/dynamic";

function ClassAssignmentsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const ClassAssignments = dynamic(
  () => import("./index").then((mod) => ({ default: mod.ClassAssignments })),
  {
    ssr: false,
    loading: () => <ClassAssignmentsLoading />,
  }
);

interface ClassAssignmentsLoaderProps {
  classId: string;
  pageSize?: number;
  initialPage?: number;
  initialSearch?: string;
  isTeacher?: boolean;
}

export default function ClassAssignmentsLoader({
  classId,
  pageSize,
  initialPage,
  initialSearch,
  isTeacher,
}: ClassAssignmentsLoaderProps) {
  return (
    <ClassAssignments
      classId={classId}
      pageSize={pageSize}
      initialPage={initialPage}
      initialSearch={initialSearch}
      isTeacher={isTeacher}
    />
  );
}
