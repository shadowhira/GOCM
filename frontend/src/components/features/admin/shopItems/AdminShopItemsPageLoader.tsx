"use client";

import dynamic from "next/dynamic";

interface AdminShopItemsPageLoaderProps {
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

const AdminShopItemsPageComponent = dynamic(
  () => import("./index").then((mod) => ({ default: mod.AdminShopItemsPage })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export const AdminShopItemsPageLoader = ({ initialPage, initialPageSize }: AdminShopItemsPageLoaderProps) => {
  return <AdminShopItemsPageComponent initialPage={initialPage} initialPageSize={initialPageSize} />;
};
