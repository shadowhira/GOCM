"use client";

import dynamic from "next/dynamic";

// Loading component
function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

// Dynamic import - code-split Dashboard and its dependencies
const Dashboard = dynamic(
  () => import("./index").then((mod) => ({ default: mod.Dashboard })),
  {
    ssr: false,
    loading: () => <DashboardLoading />,
  }
);

export default function DashboardLoader() {
  return <Dashboard />;
}
