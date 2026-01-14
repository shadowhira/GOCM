import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import { Fragment, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  useGetLiveRoomParticipant,
  useRemoveParticipant,
} from "@/queries/liveRoomQueries";
import { RoleInClass } from "@/types/class";
import type { ParticipantResponse } from "@/types/participant";
import type { RemoveParticipantRequest } from "@/types/liveRoom";
import { ParticipantRow } from "./ParticipantRow";
import { getApiErrorMessage } from "@/lib/api-error";

type ParticipantListProps = {
  liveRoomId: number;
  participantId: number;
  participant: ParticipantResponse;
  classId?: number;
};

export default function ParticipantList({
  liveRoomId,
  participantId,
  participant,
  classId,
}: ParticipantListProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const { data: participantsData } = useGetLiveRoomParticipant(liveRoomId);
  const removeParticipant = useRemoveParticipant();

  const participants = useMemo(() => {
    const list = [...(participantsData ?? [])];
    list.sort((a, b) => {
      const weight = (participant: ParticipantResponse) => {
        if (participant.id === participantId) return 0;
        if (participant.isRaisingHand) return 1;
        return 2;
      };

      return weight(a) - weight(b);
    });
    return list;
  }, [participantsData, participantId]);

  // const currentParticipant = useMemo(
  //   () => participantsData?.find((participant) => participant.id === participantId),
  //   [participantsData, participantId]
  // );

  const isTeacher = participant.classMember.roleInClassValue === RoleInClass.TEACHER;

  const removeParticipantHandler = useCallback(
    async (participant: ParticipantResponse) => {
      try {
        const payload: RemoveParticipantRequest = {
          participantId: participant.id,
          liveRoomId,
        };
        await removeParticipant.mutateAsync(payload);

        toast.success(
          t("live_room_remove_participant_success", {
            name: participant.classMember.userName,
          })
        );
      } catch (error) {
        toast.error(getApiErrorMessage(error, t("error_occurred"), t));
      }
    },
    [liveRoomId, removeParticipant, t]
  );

  const participantsButtonLabel = t("live_room_participants_button");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="lk-button"
          aria-label={participantsButtonLabel}
          title={participantsButtonLabel}
        >
          <Users />
          <span className="sr-only">{participantsButtonLabel}</span>
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-sm overflow-auto flex flex-col gap-4"
        style={{ height: "65vh" }}
        aria-describedby={undefined}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader className="grow-0">
          <DialogTitle>{t("live_room_participants_title")}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="rounded-md">
          {participants.map((participant, index) => (
            <Fragment key={participant.id}>
              <ParticipantRow
                participant={participant}
                index={index}
                isTeacher={Boolean(isTeacher)}
                liveRoomId={liveRoomId}
                currentParticipantId={participantId}
                onRemoveParticipant={removeParticipantHandler}
                classId={classId}
              />
              <Separator />
            </Fragment>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
