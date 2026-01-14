"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useState } from "react";

// Cấu hình QueryClient
export const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache 5 phút cho dữ liệu "tương đối tươi"
        staleTime: 5 * 60 * 1000,
        // Giữ data trong 30 phút trước khi GC (gc = garbage collect, là thời gian mà một query không active sẽ bị xóa khỏi cache)
        gcTime: 30 * 60 * 1000,
        // Chỉ retry 1 lần khi request lỗi
        retry: 1,
        // Tự động fetch khi focus lại window
        refetchOnWindowFocus: false,
      },
    },
  });
};

// Sử dụng useState để đảm bảo QueryClient duy nhất trên client (để tránh mất cache do tạo mới queryClient khi Component re-render)
let browserQueryClient: QueryClient | undefined = undefined;

export default function TanstackProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [queryClient] = useState(() => {
    // Reuse client trên browser để tránh memory leaks dẫn đến mất cache khi component re-render
    if (typeof window !== "undefined") {
      if (!browserQueryClient) browserQueryClient = makeQueryClient();
      return browserQueryClient;
    }
    // Tạo mới cho mỗi request trên server nhằm tránh data leak giữa các queryClient (user)
    return makeQueryClient();
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Chỉ bật devtools ở môi trường development */}
      {/* {process.env.NODE_ENV === "development" && ( */}
      <ReactQueryDevtools initialIsOpen={false} />
      {/* )} */}
    </QueryClientProvider>
  );
}
