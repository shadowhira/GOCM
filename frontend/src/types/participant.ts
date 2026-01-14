import { ClassMemberResponse } from "./class";

export interface ParticipantResponse {
  id: number,
  livekitIdentity: string,
  isRaisingHand: boolean,
  classMember: ClassMemberResponse
}
