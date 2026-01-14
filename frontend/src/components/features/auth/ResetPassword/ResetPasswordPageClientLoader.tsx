"use client";

import dynamic from "next/dynamic";

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-200 via-background to-secondary-200 p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

const ResetPasswordPageClientComponent = dynamic(
  () => import("./ResetPasswordPageClient").then((mod) => ({ default: mod.ResetPasswordPageClient })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export const ResetPasswordPageClientLoader = () => {
  return <ResetPasswordPageClientComponent />;
};
