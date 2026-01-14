import httpClient from "@/lib/axios";
import {
  GetPaginatedLiveRoomsRequest,
  CreateLiveRoomRequest,
  UpdateLiveRoomRequest,
  PaginatedLiveRoomResponse,
  LiveRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  UpdateParticipantRaiseHandRequest,
  MessageResponse,
  SendMessageRequest,
  RemoveParticipantRequest,
  CreateRoomNotification,
  LiveRoomStatisticResponse,
} from "@/types/liveRoom";
import { ParticipantResponse } from "@/types/participant";

const url = "LiveRoom";
export const liveRoomApi = {
  getAll: (): Promise<LiveRoomResponse[]> => httpClient.get(url + "/All"),

  getList: (
    params: GetPaginatedLiveRoomsRequest
  ): Promise<PaginatedLiveRoomResponse> =>
    httpClient.get(url + "/List", { params }),

  getById: (id: number): Promise<LiveRoomResponse> =>
    httpClient.get(`${url}/${id}`),

  create: (payload: CreateLiveRoomRequest): Promise<void> =>
    httpClient.post(url, payload),

  update: (payload: UpdateLiveRoomRequest): Promise<void> =>
    httpClient.put(url, payload),

  delete: (id: number): Promise<void> => httpClient.delete(`${url}/${id}`),

  joinRoom: (payload: JoinRoomRequest): Promise<JoinRoomResponse> =>
    httpClient.post(url + "/join-room", payload),

  raiseHand: (payload: UpdateParticipantRaiseHandRequest): Promise<void> =>
    httpClient.put(url + "/raise-hand", payload),

  getParticipantsByRoomId: (
    liveRoomId: number
  ): Promise<ParticipantResponse[]> =>
    httpClient.get(`${url}/${liveRoomId}/Participants`),

  getMessagesByRoomId: (liveRoomId: number): Promise<MessageResponse[]> =>
    httpClient.get(`${url}/${liveRoomId}/Messages`),

  sendMessage: (payload: SendMessageRequest): Promise<void> =>
    httpClient.post(`${url}/send-message`, payload),

  removeParticipant: (payload: RemoveParticipantRequest): Promise<void> =>
    httpClient.post(`${url}/remove-participant`, payload),

  createRoomNotification: (payload: CreateRoomNotification): Promise<void> =>
    httpClient.post(`${url}/create-room-notification`, payload),

  getLiveRoomStatistic: (
    liveRoomId: number
  ): Promise<LiveRoomStatisticResponse> =>
    httpClient.get(`${url}/${liveRoomId}/statistic`),

  endLiveRoom: (
    liveRoomId: number
  ) : Promise<void> =>
    httpClient.post(`${url}/${liveRoomId}/end-live-room`),
};
