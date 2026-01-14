// Admin-related types
export interface AdminOverviewResponse {
  // Existing stats
  totalUsers: number;
  totalClasses: number;
  totalShopItems: number;
  // New stats
  totalAssignments: number;
  totalSubmissions: number;
  totalPosts: number;
  activeLiveRooms: number;
}
