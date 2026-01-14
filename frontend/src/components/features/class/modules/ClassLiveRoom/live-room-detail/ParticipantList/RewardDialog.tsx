import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Medal } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { formatRewardPoints } from "@/config/rewardPointRules";
import { getApiErrorMessage } from "@/lib/api-error";
import { useGrantLiveRoomParticipantReward } from "@/queries/rewardQueries";
import type { ParticipantResponse } from "@/types/participant";
import {
  LIVE_ROOM_REWARD_PRESETS,
  type LiveRoomRewardPresetKey,
} from "./constants";

type LiveRoomRewardDialogProps = {
  liveRoomId: number;
  participant: ParticipantResponse;
  onSuccess?: (points: number) => void;
};

export function LiveRoomRewardDialog({
  liveRoomId,
  participant,
  onSuccess,
}: LiveRoomRewardDialogProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState<LiveRoomRewardPresetKey>(
    LIVE_ROOM_REWARD_PRESETS[0].key
  );
  const grantReward = useGrantLiveRoomParticipantReward();

  const handleClose = useCallback(() => {
    setOpen(false);
    setNote("");
    setReason(LIVE_ROOM_REWARD_PRESETS[0].key);
  }, []);

  const handleGrantParticipantReward = useCallback(async () => {
    try {
      const response = await grantReward.mutateAsync({
        liveRoomId,
        participantId: participant.id,
        payload: {
          reason,
          note: note.trim() ? note.trim() : undefined,
        },
      });

      const selectedPreset = LIVE_ROOM_REWARD_PRESETS.find(
        (preset) => preset.key === reason
      );
      const awardedPoints =
        typeof response.points === "number"
          ? response.points
          : selectedPreset?.points ?? 0;

      toast.success(
        t("live_room_reward_success", {
          name: participant.classMember.userName,
          points: formatRewardPoints(awardedPoints),
        })
      );

      onSuccess?.(awardedPoints);
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("error_occurred"), t));
    }
  }, [grantReward, handleClose, liveRoomId, note, onSuccess, participant, reason, t]);

  const triggerLabel = t("live_room_reward_button_label");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!grantReward.isPending) {
          setOpen(next);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-primary"
          title={triggerLabel}
        >
          <Medal size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {t("live_room_reward_dialog_title", {
              name: participant.classMember.userName,
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("live_room_reward_reason_label")}</Label>
            <Select
              value={reason}
              onValueChange={(value) =>
                setReason(value as LiveRoomRewardPresetKey)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("live_room_reward_reason_placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {LIVE_ROOM_REWARD_PRESETS.map((preset) => (
                  <SelectItem key={preset.key} value={preset.key}>
                    {t(preset.translationKey, {
                      points: formatRewardPoints(preset.points),
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="live-room-reward-note">
              {t("live_room_reward_note_label")}
            </Label>
            <Textarea
              id="live-room-reward-note"
              rows={3}
              maxLength={512}
              value={note}
              placeholder={t("live_room_reward_note_placeholder")}
              onChange={(event) => setNote(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">{note.length}/512</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={grantReward.isPending}
          >
            {t("live_room_reward_cancel")}
          </Button>
          <Button onClick={handleGrantParticipantReward} disabled={grantReward.isPending}>
            {grantReward.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("live_room_reward_submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LiveRoomRewardDialog;
