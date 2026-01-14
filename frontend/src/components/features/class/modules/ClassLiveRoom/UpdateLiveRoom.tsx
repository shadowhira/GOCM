import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  UpdateLiveRoomSchema,
  UpdateLiveRoomFormData,
} from "@/schemas/liveRoomSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LiveRoomResponse, UpdateLiveRoomRequest } from "@/types/liveRoom";
import type { FieldErrors } from "react-hook-form";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUpdateLiveRoom } from "@/queries/liveRoomQueries";
import DateTimePicker from "./DateTimePicker";
import { getApiErrorMessage } from "@/lib/api-error";

type AddLiveRoomDialogProps = {
  liveRoom: LiveRoomResponse;
  onSuccess?: () => void;
};

export default function UpdateLiveRoomDialog({
  liveRoom,
  onSuccess,
}: AddLiveRoomDialogProps) {
  const t = useTranslations();
  const updateLiveRoom = useUpdateLiveRoom();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    getValues,
  } = useForm<UpdateLiveRoomFormData>({
    resolver: zodResolver(UpdateLiveRoomSchema),
    defaultValues: {
      id: liveRoom.id,
      title: liveRoom.title,
      scheduledStartAt: new Date(liveRoom.scheduledStartAt.includes('Z') || liveRoom.scheduledStartAt.includes('+') ? liveRoom.scheduledStartAt : liveRoom.scheduledStartAt + 'Z').toISOString(),
      scheduledEndAt: new Date(liveRoom.scheduledEndAt.includes('Z') || liveRoom.scheduledEndAt.includes('+') ? liveRoom.scheduledEndAt : liveRoom.scheduledEndAt + 'Z').toISOString(),
    },
  });

  // Reset form với giá trị mới khi dialog mở hoặc liveRoom thay đổi
  useEffect(() => {
    if (open) {
      reset({
        id: liveRoom.id,
        title: liveRoom.title,
        scheduledStartAt: new Date(liveRoom.scheduledStartAt.includes('Z') || liveRoom.scheduledStartAt.includes('+') ? liveRoom.scheduledStartAt : liveRoom.scheduledStartAt + 'Z').toISOString(),
        scheduledEndAt: new Date(liveRoom.scheduledEndAt.includes('Z') || liveRoom.scheduledEndAt.includes('+') ? liveRoom.scheduledEndAt : liveRoom.scheduledEndAt + 'Z').toISOString(),
      });
    }
  }, [open, liveRoom, reset]);

  const onSubmit = async (payload: UpdateLiveRoomRequest) => {
    console.log("Dữ liệu hợp lệ:", payload);
    try {
      await updateLiveRoom.mutateAsync(payload);
      setOpen(false);
      onSuccess?.();
      toast.success(t("update_successfully"));
       
    } catch (error) {
      toast.error(getApiErrorMessage(error, t("error_occurred"), t));
    }
  };

  const onError = (errors: FieldErrors<UpdateLiveRoomFormData>) => {
    console.log(getValues());
    console.log("Validation errors:", errors);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil size={16}></Pencil>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-lg"
        aria-describedby={undefined}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <DialogHeader>
            <DialogTitle>{t("live_room_update_live_room")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                {t("live_room_title_label")}
                <span className="text-error ml-1">*</span>
              </Label>
              <Input
                id="title"
                placeholder={t("live_room_title_placeholder")}
                {...register("title")}
                className={cn(errors.title && "border-red-500")}
              />
              {errors.title && (
                <p className="text-sm text-error">{t(errors.title.message!)}</p>
              )}
            </div>

            {/* Start DateTime */}
            <Controller
              control={control}
              name="scheduledStartAt"
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  label={t("live_room_start_time_label")}
                  error={t(errors.scheduledStartAt?.message ?? "")}
                />
              )}
            />

            {/* End DateTime */}
            <Controller
              control={control}
              name="scheduledEndAt"
              render={({ field }) => (
                <DateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  label={t("live_room_end_time_label")}
                  error={t(errors.scheduledEndAt?.message ?? "")}
                />
              )}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                className="flex-1"
              >
                {t("cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
