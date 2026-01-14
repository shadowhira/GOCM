import { ClassMemberResponse } from "./class";
import { ParticipantResponse } from "./participant";
import { ActivityType } from "./reward";
export enum LiveRoomStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
}

export interface CreateLiveRoomRequest {
  title: string;
  scheduledStartAt: string; // ISO date string
  scheduledEndAt: string; // ISO date string
  classId: number;
}

export interface GetPaginatedLiveRoomsRequest {
  keyword: string;
  pageNumber: number;
  pageSize: number;
  classId: number;
}

export interface UpdateLiveRoomRequest {
  id: number;
  title: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
}

export interface LiveRoomResponse {
  id: number;
  title: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  createdBy: ClassMemberResponse;
  createdAt: string;
  status: LiveRoomStatus;
  classId: number;
}

export interface PaginatedLiveRoomResponse {
  items: LiveRoomResponse[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
  liveRoomBroadcastChannel: string;
};

export type JoinRoomRequest = {
  liveRoomId: number;
};

export type JoinRoomResponse = {
  participant: ParticipantResponse;
  accessToken: string;
  roomName: string;
  participantName: string;
  livekitServerUrl: string;
  liveRoomBroadcastChannel: string;
};

export type UpdateParticipantRaiseHandRequest = {
  liveRoomId: number;
  participantId: number;
  isRaisingHand: boolean;
};

export type MessageResponse = {
  id: number;
  sentBy: ParticipantResponse;
  displayName: string;
  content: string;
  createdAt: string;
};

export type SendMessageRequest = {
  liveRoomId: number;
  participantId: number;
  content: string;
};

export type RemoveParticipantRequest = {
  liveRoomId: number;
  participantId: number;
};

export enum RoomNotificationType {
  JoinRoom = 0,
  LeaveRoom = 1,
  RaiseHand = 2,
  StartShareScreen = 3,
  StopShareScreen = 4
}

export type RoomNotification = {
  id: string, // guid
  type: RoomNotificationType,
  notification: string,
  createdAt: string,
};

export type CreateRoomNotification = {
  liveRoomId: number;
  participantId: number;
  type: RoomNotificationType
}

export type GrantLiveRoomParticipantRewardRequest = {
  reason: string;
  note?: string;
};

export type LiveRoomRewardBroadcast = {
  participantId: number;
  rewardActivityId: number;
  classId: number;
  targetUserId: number;
  targetDisplayName: string;
  activityType: ActivityType;
  deltaPoints: number;
  reason?: string | null;
};


export type ParticipantAttendanceDetailStatistic = {
  joinAt: string,
  leaveAt: string,
}

export type ParticipantAttendanceStatistic = {
  userId: number,
  userDisplayName: string,
  totalMinutes: number,
  attendanceDetails: ParticipantAttendanceDetailStatistic[]
}

export type LiveRoomStatisticResponse = {
  id: number,
  title: string,
  attendances: ParticipantAttendanceStatistic[]
}
