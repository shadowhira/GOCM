import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Hand, User, X } from "lucide-react";
import { LiveRoomRewardDialog } from "./RewardDialog";
import { useTranslations } from "next-intl";
import type { ParticipantResponse } from "@/types/participant";
import { CosmeticAvatar, CosmeticBadge } from "@/components/features/cosmetics";
import {
  UserDetailModal,
  ClickableAvatarWrapper,
  useUserDetailModal,
  type UserBasicInfo,
  type UserClassContext,
} from "@/components/features/user";
import { RoleInClass } from "@/types/class";

type ParticipantRowProps = {
  participant: ParticipantResponse;
  index: number;
  isTeacher: boolean;
  liveRoomId: number;
  currentParticipantId: number;
  onRemoveParticipant: (participant: ParticipantResponse) => void | Promise<void>;
  classId?: number;
};

export function ParticipantRow({
  participant,
  index,
  isTeacher,
  liveRoomId,
  currentParticipantId,
  onRemoveParticipant,
  classId,
}: ParticipantRowProps) {
  const t = useTranslations();
  const displayIndex = `${index + 1}.`;


  // Của thành
  const { isOpen: isUserModalOpen, selectedUser, classContext, openModal: openUserModal, setIsOpen: setUserModalOpen } = useUserDetailModal();
  const handleAvatarClick = () => {
    const member = participant.classMember;
    const userBasicInfo: UserBasicInfo = {
      id: member.userId,
      displayName: member.userName,
      email: member.userEmail,
      avatarUrl: member.avatarUrl,
    };
    const userClassContext: UserClassContext = {
      classId: classId ?? 0, // ClassId from parent context
      classMemberId: member.id,
      roleInClass: member.roleInClassValue as RoleInClass,
      roleInClassLabel: member.roleInClass,
      points: member.points ?? 0,
      enrollDate: member.enrollDate,
      cosmetics: member.cosmetics,
    };
    openUserModal(userBasicInfo, userClassContext);
  };
  //
  const itsMe = currentParticipantId === participant.id;
  return (
    <div className="flex items-center gap-3 p-2 pl-4 pr-4">
      <ClickableAvatarWrapper onClick={handleAvatarClick}>
        <CosmeticAvatar
          classId={classId}
          classMemberId={participant.classMember.id}
          avatarUrl={participant.classMember.avatarUrl}
          displayName={participant.classMember.userName}
          size="sm"
          cosmetics={participant.classMember.cosmetics ?? null}
          className="self-start"
        />
      </ClickableAvatarWrapper>
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-foreground">
            {displayIndex} {participant.classMember.userName}
          </span>
          <CosmeticBadge
            classId={classId}
            classMemberId={participant.classMember.id}
            cosmetics={participant.classMember.cosmetics ?? null}
            fallbackLabel={participant.classMember.roleInClass}
            size="sm"
            showWhenDisabled
          />
          {participant.isRaisingHand && (
            <Hand size={16} color="#ffd500" strokeWidth={1.5} />
          )}
        </div>
        <Badge variant="secondary" className="w-fit text-xs">
          {t("live_room_reward_points_badge", {
            points: participant.classMember.points,
          })}
        </Badge>
      </div>

      <span className="ml-auto flex items-center gap-1">
        {isTeacher && !itsMe && (
          <LiveRoomRewardDialog
            liveRoomId={liveRoomId}
            participant={participant}
          />
        )}

        {!itsMe && isTeacher && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
              >
                <X size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("confirm")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("live_room_remove_participant_confirmation", {
                    name: participant.classMember.userName,
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemoveParticipant(participant)}
                >
                  {t("confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {itsMe && (
          <User size={16} className="text-muted-foreground" />
        )}
      </span>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          classContext={classContext}
          open={isUserModalOpen}
          onOpenChange={setUserModalOpen}
        />
      )}
    </div>
  );
}

export default ParticipantRow;
