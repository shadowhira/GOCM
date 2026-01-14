"use client";

import dynamic from "next/dynamic";

function ClassStoreLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const ClassStore = dynamic(
  () => import("./index").then((mod) => ({ default: mod.ClassStore })),
  {
    ssr: false,
    loading: () => <ClassStoreLoading />,
  }
);

interface ClassStoreLoaderProps {
  classId: string;
}

export default function ClassStoreLoader({ classId }: ClassStoreLoaderProps) {
  return <ClassStore classId={classId} />;
}
