// Enums
export enum AssignmentStatus {
  Assigned = 0,
  Expired = 1,
}

export enum AssignmentType {
  Essay = 0,
  Quiz = 1,
  Group = 2,
}

export enum QuestionType {
  SingleChoice = 0,
  MultipleChoice = 1,
}

export enum FileType {
  PDF = 0,
  WORD = 1,
  EXCEL = 2,
  POWERPOINT = 3,
  IMAGE = 4,
  VIDEO = 5,
  AUDIO = 6,
  TEXT = 7,
  ZIP = 8,
  OTHER = 9,
}

export enum ParentType {
  ASSIGNMENT = 0,
  POST = 1,
  COMMENT = 2,
  SUBMISSION = 3,
}

export enum SourceType {
  // TODO: Define values when backend implements this enum
}

export const ChannelName = {
  Common: "common"
}

export const ChannelEventName = {
  ParticipantRaiseHandUpdated: "participant_raise_hand_updated",
  NewMessage: "new_message",
  PartipantJoinRoom: "participant_join_room",
  RoomNotification: "room_notification",
  LiveRoomRewardGranted: "live_room_reward_granted",
  SystemNotification: "system_notification"
}
