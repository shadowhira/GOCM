import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { liveRoomApi } from "@/api/liveRoomApi";
import {
  CreateLiveRoomRequest,
  CreateRoomNotification,
  GetPaginatedLiveRoomsRequest,
  JoinRoomRequest,
  RemoveParticipantRequest,
  SendMessageRequest,
  UpdateLiveRoomRequest,
  UpdateParticipantRaiseHandRequest,
} from "@/types/liveRoom";

// ============ QUERY KEYS ============
export const liveRoomKeys = {
  all: ["liveRooms"] as const,
  lists: () => [...liveRoomKeys.all, "list"],
  list: (params: GetPaginatedLiveRoomsRequest) =>
    [...liveRoomKeys.lists(), params] as const,
  details: () => [...liveRoomKeys.all, "detail"],
  detail: (id: number) => [...liveRoomKeys.details(), id] as const,
};

export const participantKeys = {
  all: ["participants"] as const,
  roomParticipants: (liveRoomId: number) => [
    ...participantKeys.all,
    "liveRoom",
    liveRoomId,
    "participants",
  ],
};

export const messageKeys = {
  all: ["messages"] as const,
  roomMessages: (liveRoomId: number) => [
    ...messageKeys.all,
    "liveRoom",
    liveRoomId,
    "messages",
  ],
};

export const statisticKeys = {
  all: ["statistics"] as const,
  roomStatistic: (liveRoomId: number) => [
    ...statisticKeys.all,
    "liveRoom",
    liveRoomId,
    "statistic",
  ],
};

// ============ QUERIES (GET) ============
/**
 * Lấy toàn bộ danh sách phòng học trực tuyến (không phân trang)
 */
export const useGetAllLiveRooms = () => {
  return useQuery({
    queryKey: liveRoomKeys.all,
    queryFn: () => liveRoomApi.getAll(),
  });
};

/**
 * Lấy danh sách phòng học có phân trang và filter
 */
export const useGetLiveRoomsList = (params: GetPaginatedLiveRoomsRequest) => {
  return useQuery({
    queryKey: liveRoomKeys.list(params),
    queryFn: () => liveRoomApi.getList(params),
    refetchInterval: 10 * 1000, // 10s
  });
};

/**
 * Lấy thông tin chi tiết một phòng học theo ID
 */
export const useGetLiveRoomById = (id: number) => {
  return useQuery({
    queryKey: liveRoomKeys.detail(id),
    queryFn: () => liveRoomApi.getById(id),
  });
};

/**
 * Lấy danh sách participants đang tham gia phòng học
 */
export const useGetLiveRoomParticipant = (liveRoomId: number) => {
  return useQuery({
    queryKey: participantKeys.roomParticipants(liveRoomId),
    queryFn: () => liveRoomApi.getParticipantsByRoomId(liveRoomId),
  });
};

/**
 * Lấy danh sách messages trong phòng học
 */
export const useGetLiveRoomMessages = (liveRoomId: number) => {
  return useQuery({
    queryKey: messageKeys.roomMessages(liveRoomId),
    queryFn: () => liveRoomApi.getMessagesByRoomId(liveRoomId),
  });
};

/**
 * Lấy thống kê vào/ra trong phòng học
 */
export const useGetLiveRoomStatistic = (liveRoomId: number) => {
  return useQuery({
    queryKey: statisticKeys.roomStatistic(liveRoomId),
    queryFn: () => liveRoomApi.getLiveRoomStatistic(liveRoomId),
    enabled: false,
  });
};

// ============ MUTATIONS (POST/PUT/DELETE) ============
export const useCreateLiveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLiveRoomRequest) => liveRoomApi.create(payload),
    onSuccess: () => {
      // Refresh danh sách lớp
      queryClient.invalidateQueries({ queryKey: liveRoomKeys.all });
    },
  });
};

export const useUpdateLiveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateLiveRoomRequest) => liveRoomApi.update(payload),
    onSuccess: () => {
      // Refresh thông tin lớp vừa update
      queryClient.invalidateQueries({ queryKey: liveRoomKeys.all });
    },
  });
};

export const useDeleteLiveRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => liveRoomApi.delete(id),
    onSuccess: () => {
      // Refresh toàn bộ danh sách lớp
      queryClient.invalidateQueries({ queryKey: liveRoomKeys.all });
    },
  });
};

export const useJoinRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JoinRoomRequest) => liveRoomApi.joinRoom(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: participantKeys.roomParticipants(payload.liveRoomId),
      });
    },
  });
};

export const useRaiseHand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateParticipantRaiseHandRequest) =>
      liveRoomApi.raiseHand(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantKeys.all });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendMessageRequest) =>
      liveRoomApi.sendMessage(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.roomMessages(payload.liveRoomId),
      });
    },
  });
};

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RemoveParticipantRequest) =>
      liveRoomApi.removeParticipant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: participantKeys.all });
    },
  });
};

export const useCreateRoomNotification = () => {
  return useMutation({
    mutationFn: (payload: CreateRoomNotification) =>
      liveRoomApi.createRoomNotification(payload),
  });
};

export const useEndLiveRoom = () => {
  return useMutation({
    mutationFn: (liveRoomId: number) =>
      liveRoomApi.endLiveRoom(liveRoomId),
  });
};
