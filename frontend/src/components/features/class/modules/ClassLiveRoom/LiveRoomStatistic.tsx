import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Fragment, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FileClock, Eye } from "lucide-react";
import { Button } from "@/components/ui";
import {
  LiveRoomResponse,
  ParticipantAttendanceStatistic,
} from "@/types/liveRoom";
import { useGetLiveRoomStatistic } from "@/queries/liveRoomQueries";
import { formatLocalDateTime } from "@/lib/utils";
type LiveRoomStatisticProps = {
  liveRoom: LiveRoomResponse;
};

export default function LiveRoomStatistic({
  liveRoom,
}: LiveRoomStatisticProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  // Only fetch when dialog is open
  const { data, refetch } = useGetLiveRoomStatistic(liveRoom.id);

  useEffect(() => {
    if (open) {
      refetch(); // Manually refetch when dialog opens
    }
  }, [open, refetch]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("live_room_statistic_button_label")}
        >
          <FileClock size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg overflow-auto flex flex-col gap-4"
        style={{ height: "65vh" }}
        aria-describedby={undefined}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader className="grow-0">
          <DialogTitle>
            {t("live_room_statistic_dialog_title", {
              title: data?.title ?? "",
            })}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="rounded-md">
          <div className="flex items-center gap-3 p-2 pl-4 pr-4">
            <span>{t("live_room_statistic_header_name")}</span>

            <span className="ml-auto flex items-center gap-1">
              {t("live_room_statistic_header_total_minutes")}
            </span>
          </div>
          {data?.attendances.map((participantStatistic, index) => (
            <Fragment key={index}>
              <div className="flex items-center gap-3 p-2 pl-4 pr-4">
                <span>
                  {index + 1 + "."} {participantStatistic.userDisplayName}
                </span>

                <span className="ml-auto flex items-center gap-1">
                  {/* {participantStatistic.totalMinutes}{" "} */}
                  {t("live_room_statistic_minutes_suffix", {
                    minutes: participantStatistic.totalMinutes,
                  })}
                  <AttendanceDetailsStatistic
                    participantStatistic={participantStatistic}
                  />
                </span>
              </div>
              <Separator />
            </Fragment>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

type AttendanceDetailStatisticProps = {
  participantStatistic: ParticipantAttendanceStatistic;
};

function AttendanceDetailsStatistic({
  participantStatistic,
}: AttendanceDetailStatisticProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"} size="icon">
          <Eye />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg overflow-auto flex flex-col gap-4"
        style={{ height: "65vh" }}
        aria-describedby={undefined}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader className="grow-0">
          <DialogTitle>
            {t("live_room_statistic_detail_title", {
              name: participantStatistic.userDisplayName,
            })}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="rounded-md">
          <div className="flex items-center gap-3 p-2 pl-4 pr-4">
            <span>{t("live_room_statistic_detail_join")}</span>
            <span className="ml-auto">
              {t("live_room_statistic_detail_leave")}
            </span>
          </div>
          {participantStatistic?.attendanceDetails.map((detail, index) => (
            <Fragment key={index}>
              <div className="flex items-center gap-3 p-2 pl-4 pr-4">
                <span>{formatLocalDateTime(detail.joinAt)}</span>

                <span className="ml-auto flex items-center gap-1">
                  {detail.leaveAt
                    ? formatLocalDateTime(detail.leaveAt)
                    : t("live_room_statistic_detail_leave_unknown")}
                </span>
              </div>
              <Separator />
            </Fragment>
          ))}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
