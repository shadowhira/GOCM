"use client";

import { useTranslations } from "next-intl";
import LiveRoomsTable from "./LiveRoomsTable";
import AddLiveRoomDialog from "./AddLiveRoom";
import { useGetCurrentClassMember } from "@/queries";
import { useCurrentUser } from "@/store/auth";
import { RoleInClass } from "@/types/class";
interface ClassLiveRoomProps {
  classId: string;
}

export const ClassLiveRoom = ({ classId }: ClassLiveRoomProps) => {
  const t = useTranslations();
  const currentUser = useCurrentUser();
  const { data: currentClasSMember } = useGetCurrentClassMember(
    parseInt(classId),
    currentUser?.id
  );
  const isTeacher =
    currentClasSMember?.roleInClassValue === RoleInClass.TEACHER;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">
            {t("sidebar_live_room")}
          </h1>
        </div>
        {isTeacher && <AddLiveRoomDialog classId={classId}></AddLiveRoomDialog>}
      </div>
      <LiveRoomsTable classId={classId} roleInClass={currentClasSMember?.roleInClassValue}></LiveRoomsTable>
    </div>
  );
};
