import { ShopItemTier, ShopItemVisualType } from './shopItem'

// Enums
export enum RoleInClass {
  TEACHER = 0,
  STUDENT = 1
}

export enum CosmeticSlot {
  AvatarFrame = 0,
  ChatFrame = 1,
  Badge = 2
}

// Request Types
export interface GetPaginatedClassesRequest {
  keyword?: string;
  pageNumber?: number;
  pageSize?: number;
  name?: string;
  onlyMine?: boolean;
}

export interface CreateClassRequest {
  name: string;
  description?: string;
}

export interface UpdateClassRequest {
  name: string;
  description?: string;
  coverImageUrl?: string;
  coverColor?: string;
}

export interface JoinClassRequest {
  joinCode: string;
}

export interface UpdateClassMemberRequest {
  roleInClass: RoleInClass;
  points: number;
  enrollDate?: string;
}

export interface ClassAppearanceSettingsResponse {
  showAvatarFrames: boolean;
  showChatFrames: boolean;
  showBadges: boolean;
  updatedAt: string;
}

export interface UpdateClassAppearanceSettingsRequest {
  showAvatarFrames: boolean;
  showChatFrames: boolean;
  showBadges: boolean;
}

// Response Types
export interface ClassResponse {
  id: number;
  name: string;
  description?: string;
  joinCode: string;
  createdAt: string;
  createdByUserId: number;
  createdByUserName: string;
  createdByUserAvatarUrl?: string;
  memberCount: number;
  userRoleInClass?: RoleInClass;
  appearanceSettings: ClassAppearanceSettingsResponse;
  // New fields for dashboard
  pendingAssignmentsCount?: number;  // Số bài tập chưa nộp, còn hạn (cho student)
  nextDeadline?: string;  // Deadline gần nhất (cho student)
  coverImageUrl?: string;  // URL ảnh bìa (future)
  coverColor?: string;     // Màu nền (future)
}

export interface ClassMemberResponse {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  roleInClass: string;
  roleInClassValue: RoleInClass;
  enrollDate: string;
  points: number;
  cosmetics?: ClassMemberCosmeticSlotsResponse | null;
}

export interface PaginatedClassResponse {
  items: ClassResponse[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AddClassShopItemsRequest {
  shopItemIds: number[];
}

export interface ClassShopItemResponse {
  id: number;
  classId: number;
  shopItemId: number;
  name: string;
  description?: string;
  costInPoints: number;
  iconUrl: string;
  visualType: ShopItemVisualType;
  tier: ShopItemTier;
  isDefault: boolean;
  isPurchasedByCurrentUser: boolean;
  purchaseCountByCurrentUser: number;
  lastPurchasedAt?: string | null;
  usageDurationDays: number;
  expiresAt?: string | null;
  remainingDays: number;
  equippedInSlot?: CosmeticSlot | null;
  isEquippedByCurrentUser: boolean;
  canEquip: boolean;
}

export interface PurchaseShopItemResponse {
  classId: number;
  shopItemId: number;
  costInPoints: number;
  remainingPoints: number;
  redeemedAt: string;
  usageDurationDays: number;
  expiresAt: string;
  totalPurchases: number;
}

export type CosmeticConfig = Record<string, unknown>;

export interface EquippedCosmeticItemResponse {
  shopItemId: number;
  name: string;
  iconUrl: string;
  visualType: ShopItemVisualType;
  tier: ShopItemTier;
  expiresAt?: string | null;
  remainingDays: number;
  config?: CosmeticConfig | null;
}

export interface ClassMemberCosmeticSlotsResponse {
  avatarFrame?: EquippedCosmeticItemResponse | null;
  chatFrame?: EquippedCosmeticItemResponse | null;
  badge?: EquippedCosmeticItemResponse | null;
}

export interface ClassMemberCosmeticResponse
  extends ClassMemberCosmeticSlotsResponse {
  classMemberId: number;
  userId: number;
  classId: number;
  updatedAt: string;
}

export interface EquipClassCosmeticRequest {
  slot: CosmeticSlot;
  shopItemId?: number | null;
}

export interface UploadClassCoverResponse {
  coverImageUrl: string;
}

export interface InviteToClassRequest {
  email: string;
}