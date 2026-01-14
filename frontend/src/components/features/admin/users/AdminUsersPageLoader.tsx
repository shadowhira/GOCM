"use client";

import dynamic from "next/dynamic";

interface AdminUsersPageLoaderProps {
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

const AdminUsersPageComponent = dynamic(
  () => import("./index").then((mod) => ({ default: mod.AdminUsersPage })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export const AdminUsersPageLoader = ({ initialPage, initialPageSize }: AdminUsersPageLoaderProps) => {
  return <AdminUsersPageComponent initialPage={initialPage} initialPageSize={initialPageSize} />;
};
