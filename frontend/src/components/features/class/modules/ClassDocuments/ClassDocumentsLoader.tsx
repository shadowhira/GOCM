"use client";

import dynamic from "next/dynamic";

function ClassDocumentsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const ClassDocuments = dynamic(
  () => import("./index").then((mod) => ({ default: mod.ClassDocuments })),
  {
    ssr: false,
    loading: () => <ClassDocumentsLoading />,
  }
);

interface ClassDocumentsLoaderProps {
  classId: string;
}

export default function ClassDocumentsLoader({ classId }: ClassDocumentsLoaderProps) {
  return <ClassDocuments classId={classId} />;
}
