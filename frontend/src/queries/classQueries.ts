import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classApi } from '@/api/classApi';
import type {
  GetPaginatedClassesRequest,
  CreateClassRequest,
  UpdateClassRequest,
  JoinClassRequest,
  AddClassShopItemsRequest,
  UpdateClassMemberRequest,
  UpdateClassAppearanceSettingsRequest,
  EquipClassCosmeticRequest,
  ClassMemberCosmeticResponse,
  InviteToClassRequest,
} from '@/types/class';

// ============ QUERY KEYS ============
export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (params?: GetPaginatedClassesRequest) => [...classKeys.lists(), params] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: number) => [...classKeys.details(), id] as const,
  myClasses: () => [...classKeys.all, 'my'] as const,
  members: (classId: number) => [...classKeys.all, 'members', classId] as const,
  memberByUser: (classId: number, userId: number) => [...classKeys.members(classId), 'self', userId] as const,
  shopItems: (classId: number) => [...classKeys.all, 'shop-items', classId] as const,
  appearanceSettings: (classId: number) => [...classKeys.all, 'appearance-settings', classId] as const,
  cosmetics: (classId: number) => [...classKeys.all, 'cosmetics', classId] as const,
} as const;

// ============ QUERIES (GET) ============

/**
 * Lấy toàn bộ danh sách lớp (không phân trang)
 */
export const useGetAllClasses = () => {
  return useQuery({
    queryKey: classKeys.all,
    queryFn: () => classApi.getAll(),
  });
};

/**
 * Lấy danh sách lớp có phân trang và filter
 */
export const useGetClassList = (params?: GetPaginatedClassesRequest) => {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => classApi.getList(params),
  });
};

/**
 * Lấy thông tin chi tiết một lớp theo ID
 */
export const useGetClassById = (id: number) => {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => classApi.getById(id),
    enabled: !!id, // Chỉ chạy query khi id tồn tại
  });
};

/**
 * Lấy danh sách lớp của user hiện tại
 */
export const useGetMyClasses = () => {
  return useQuery({
    queryKey: classKeys.myClasses(),
    queryFn: () => classApi.getMy(),
  });
};

/**
 * Lấy danh sách thành viên trong lớp
 */
export const useGetClassMembers = (classId: number) => {
  return useQuery({
    queryKey: classKeys.members(classId),
    queryFn: () => classApi.getMembers(classId),
    enabled: !!classId,
  });
};

/**
 * Lấy thông tin thành viên hiện tại trong lớp (dùng để lấy điểm)
 */
export const useGetCurrentClassMember = (classId: number, userId?: number) => {
  return useQuery({
    queryKey: classKeys.memberByUser(classId, userId ?? 0),
    queryFn: async () => {
      const members = await classApi.getMembers(classId);
      return members.find((member) => member.userId === userId) ?? null;
    },
    enabled: !!classId && !!userId,
  });
};

/**
 * Lấy danh sách vật phẩm trong cửa hàng của lớp
 */
export const useGetClassShopItems = (classId: number) => {
  return useQuery({
    queryKey: classKeys.shopItems(classId),
    queryFn: () => classApi.getShopItems(classId),
    enabled: !!classId,
  });
};

export const useGetClassCosmetics = (classId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: classKeys.cosmetics(classId),
    queryFn: () => classApi.getCosmetics(classId),
    enabled: !!classId && (options?.enabled ?? true),
  });
};

/**
 * Lấy cấu hình hiển thị phần thưởng của lớp
 */
export const useGetClassAppearanceSettings = (classId: number) => {
  return useQuery({
    queryKey: classKeys.appearanceSettings(classId),
    queryFn: () => classApi.getAppearanceSettings(classId),
    enabled: !!classId,
  });
};

// ============ MUTATIONS (POST/PUT/DELETE) ============

/**
 * Tạo mới một lớp
 */
export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassRequest) => classApi.create(data),
    onSuccess: () => {
      // Refresh danh sách lớp và lớp của tôi
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.myClasses() });
    },
  });
};

/**
 * Cập nhật thông tin lớp
 */
export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClassRequest }) => 
      classApi.update(id, data),
    onSuccess: (_, { id }) => {
      // Refresh thông tin lớp vừa update và toàn bộ danh sách
      queryClient.invalidateQueries({ queryKey: classKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.myClasses() });
    },
  });
};

/**
 * Xóa một lớp
 */
export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => 
      classApi.remove(id),
    onSuccess: () => {
      // Refresh toàn bộ danh sách lớp và lớp của tôi
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.myClasses() });
    },
  });
};

/**
 * Tham gia vào một lớp
 */
export const useJoinClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinClassRequest) => classApi.join(data),
    onSuccess: () => {
      // Refresh danh sách lớp
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.myClasses() });
    },
  });
};

/**
 * Rời khỏi lớp
 */
export const useLeaveClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => 
      classApi.leave(id),
    onSuccess: () => {
      // Refresh danh sách lớp và lớp của tôi
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
      queryClient.invalidateQueries({ queryKey: classKeys.myClasses() });
    },
  });
};

/**
 * Xóa thành viên khỏi lớp (chỉ teacher)
 */
export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classId, memberId }: { classId: number; memberId: number }) => 
      classApi.removeMember(classId, memberId),
    onSuccess: (_, { classId }) => {
      // Refresh danh sách members
      queryClient.invalidateQueries({ queryKey: classKeys.members(classId) });
    },
  });
};

/**
 * Cập nhật thông tin thành viên trong lớp (chỉ teacher)
 */
export const useUpdateClassMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      classId,
      memberId,
      data,
    }: {
      classId: number;
      memberId: number;
      data: UpdateClassMemberRequest;
    }) => classApi.updateMember(classId, memberId, data),
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.members(classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(classId) });
    },
  });
};

/**
 * Thêm nhiều vật phẩm vào cửa hàng của lớp
 */
export const useAddClassShopItems = (classId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddClassShopItemsRequest) => classApi.addShopItems(classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.shopItems(classId) });
    },
  });
};

/**
 * Xóa vật phẩm khỏi cửa hàng của lớp
 */
export const useRemoveClassShopItem = (classId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (classShopItemId: number) => classApi.removeShopItem(classId, classShopItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.shopItems(classId) });
    },
  });
};

/**
 * Mua vật phẩm trong cửa hàng lớp bằng điểm
 */
export const usePurchaseClassShopItem = (classId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shopItemId: number) => classApi.purchaseShopItem(classId, shopItemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.shopItems(classId) });
      // queryClient.invalidateQueries({ queryKey: classKeys.members(classId) });
    },
  });
};

export const useEquipClassCosmetic = (classId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EquipClassCosmeticRequest) => classApi.equipCosmetic(classId, data),
    onSuccess: (updatedCosmetics) => {
      queryClient.setQueryData<ClassMemberCosmeticResponse[] | undefined>(
        classKeys.cosmetics(classId),
        (previous) => {
          if (!previous || previous.length === 0) {
            return [updatedCosmetics];
          }

          const index = previous.findIndex((item) => item.classMemberId === updatedCosmetics.classMemberId);

          if (index === -1) {
            return [...previous, updatedCosmetics];
          }

          const next = [...previous];
          next[index] = updatedCosmetics;
          return next;
        }
      );

      queryClient.invalidateQueries({ queryKey: classKeys.cosmetics(classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.shopItems(classId) });
    },
  });
};

/**
 * Cập nhật cấu hình hiển thị phần thưởng của lớp
 */
export const useUpdateClassAppearanceSettings = (classId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateClassAppearanceSettingsRequest) =>
      classApi.updateAppearanceSettings(classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.appearanceSettings(classId) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(classId) });
    },
  });
};

/**
 * Mời người dùng vào lớp qua email
 */
export const useInviteToClass = () => {
  return useMutation({
    mutationFn: ({ classId, data }: { classId: number; data: InviteToClassRequest }) =>
      classApi.inviteToClass(classId, data),
  });
};