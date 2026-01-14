import { QueryClient } from '@tanstack/react-query';

/**
 * Server-side QueryClient factory
 * Khác với client-side QueryClient, server QueryClient:
 * - Không cần persistent cache
 * - Không cần retry logic phức tạp
 * - Chỉ dùng để prefetch data cho hydration
 */
export function getServerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Không cache lâu trên server
        staleTime: 0,
        // Không retry trên server để tránh làm chậm SSR
        retry: false,
        // Không refetch khi window focus (không có window trên server)
        refetchOnWindowFocus: false,
        // Không refetch khi reconnect (không có network state trên server)
        refetchOnReconnect: false,
      },
    },
  });
}