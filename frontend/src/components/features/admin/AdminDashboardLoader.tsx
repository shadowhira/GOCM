"use client";

import dynamic from "next/dynamic";

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const AdminDashboardComponent = dynamic(
  () => import("./AdminDashboard").then((mod) => ({ default: mod.AdminDashboard })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export const AdminDashboardLoader = () => {
  return <AdminDashboardComponent />;
};
