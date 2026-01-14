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
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { useDeleteLiveRoom } from "@/queries/liveRoomQueries";
import { toast } from "sonner";
import { LiveRoomResponse } from "@/types/liveRoom";
import { useTranslations } from "next-intl";
import { getApiErrorMessage } from "@/lib/api-error";

type DeleteLiveRoomDialogProps = {
  liveRoom: LiveRoomResponse;
};

export default function DeleteLiveRoom({
  liveRoom,
}: DeleteLiveRoomDialogProps) {
  const deleteLiveRoom = useDeleteLiveRoom();
  const t = useTranslations();

  const deleteHandler = async () => {
    try {
      await deleteLiveRoom.mutateAsync(liveRoom.id);
      toast.success(t("delete_succesfully"));
       
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("error_occurred"), t));
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon" className="text-error">
          <Trash2 size={16}></Trash2>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("confirm")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("live_room_delete_confirmation", { title: liveRoom.title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteHandler}>
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
