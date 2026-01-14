import { useGetLiveRoomsList } from "@/queries/liveRoomQueries";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  GetPaginatedLiveRoomsRequest,
  LiveRoomResponse,
  LiveRoomStatus,
} from "@/types/liveRoom";
import { useState, useEffect } from "react";
import { formatLocalDateTime } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";
import { LIVE_ROOMS_PAGINATION } from "@/config/pagination";
import UpdateLiveRoomDialog from "./UpdateLiveRoom";
import DeleteLiveRoom from "./DeleteLiveRoom";
import { useTranslations } from "next-intl";
import LiveRoomStatistic from "./LiveRoomStatistic";
import { RoleInClass } from "@/types/class";
import { Video, Search } from "lucide-react";
import { Input } from "@/components/ui";
export default function LiveRoomsTable({
  classId,
  roleInClass,
}: {
  classId: string;
  roleInClass: RoleInClass | undefined;
}) {
  const [liveRooms, setLiveRooms] = useState<LiveRoomResponse[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  const t = useTranslations();

  const [search, setSearch] = useState<GetPaginatedLiveRoomsRequest>({
    keyword: "",
    pageNumber: 1,
    pageSize: LIVE_ROOMS_PAGINATION.DEFAULT_PAGE_SIZE,
    classId: parseInt(classId),
  });

  const { data } = useGetLiveRoomsList(search);

  useEffect(() => {
    if (data?.items) {
      setLiveRooms(data.items);
      setTotalPages(data.totalPages ?? 1);
      // setTotalItems(data.totalItems ?? 0);
    }
  }, [data]);

  const handlePageChange = (page: number) => {
    setSearch((prev) => ({ ...prev, pageNumber: page }));
  };

  const handleSearchChange = (keyword: string) => {
    setSearch((prev) => ({ ...prev, keyword: keyword }));
  };

  const getLiveRoomStatusText = (status: LiveRoomStatus): string => {
    const mapper: Record<LiveRoomStatus, string> = {
      [LiveRoomStatus.NotStarted]: t("live_room_not_started"),
      [LiveRoomStatus.InProgress]: t("live_room_in_progress"),
      [LiveRoomStatus.Completed]: t("live_room_completed"),
    };

    return mapper[status] ?? t("live_room_status_undefined");
  };

  const joinRoom = (roomId: string | number) => {
    const url = `/live-room/${roomId}`;
    window.open(url, "_blank");
  };

  const isTeacher = roleInClass === RoleInClass.TEACHER;

  return (
    <div className="space-y-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("search_live_room")}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Table>
        {/* <TableCaption>{t("live_room_table_caption")}</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead>{t("live_room_table_index")}</TableHead>
            <TableHead>{t("live_room_table_title")}</TableHead>
            <TableHead>{t("live_room_table_status")}</TableHead>
            <TableHead>{t("live_room_table_scheduled_start")}</TableHead>
            <TableHead>{t("live_room_table_scheduled_end")}</TableHead>
            <TableHead>{t("live_room_table_created_at")}</TableHead>
            <TableHead>{t("live_room_table_created_by")}</TableHead>
            <TableHead>{t("live_room_table_actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {liveRooms.map((e, index) => (
            <TableRow key={e.id}>
              <TableCell className="text-center">
                {(search.pageNumber - 1) * search.pageSize + index + 1}
              </TableCell>
              <TableCell>{e.title}</TableCell>
              <TableCell>{getLiveRoomStatusText(e.status)}</TableCell>
              <TableCell>{formatLocalDateTime(e.scheduledStartAt)}</TableCell>
              <TableCell>{formatLocalDateTime(e.scheduledEndAt)}</TableCell>
              <TableCell>{formatLocalDateTime(e.createdAt)}</TableCell>
              <TableCell>
                {e.createdBy?.userName ?? t("live_room_undefined_user")}
              </TableCell>
              <TableCell>
                <div
                  className="flex items-center gap-2"
                  // onDoubleClick={(e) => e.stopPropagation()}
                >
                  {(e.status === LiveRoomStatus.InProgress ||
                    (e.status === LiveRoomStatus.NotStarted && isTeacher)) && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => joinRoom(e.id)}
                      className="gap-1"
                    >
                      <Video className="h-4 w-4" />
                      {t("join")}
                    </Button>
                  )}

                  {isTeacher && (
                    <>
                      <UpdateLiveRoomDialog liveRoom={e}></UpdateLiveRoomDialog>
                      <DeleteLiveRoom liveRoom={e}></DeleteLiveRoom>
                      <LiveRoomStatistic liveRoom={e}></LiveRoomStatistic>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={8} className="p-4">
              <Pagination
                currentPage={search.pageNumber}
                totalPages={totalPages}
                pageSize={search.pageSize}
                // totalItems={totalItems}
                onPageChange={handlePageChange}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
