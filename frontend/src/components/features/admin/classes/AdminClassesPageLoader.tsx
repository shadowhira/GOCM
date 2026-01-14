"use client";

import dynamic from "next/dynamic";

interface AdminClassesPageLoaderProps {
  initialPage?: number;
  initialPageSize?: number;
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const AdminClassesPageComponent = dynamic(
  () => import("./index").then((mod) => ({ default: mod.AdminClassesPage })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export const AdminClassesPageLoader = ({ initialPage, initialPageSize }: AdminClassesPageLoaderProps) => {
  return <AdminClassesPageComponent initialPage={initialPage} initialPageSize={initialPageSize} />;
};
