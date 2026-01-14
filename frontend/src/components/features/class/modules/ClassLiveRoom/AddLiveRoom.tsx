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
import { Loader2, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  CreateLiveRoomSchema,
  CreateLiveRoomFormData,
} from "@/schemas/liveRoomSchema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateLiveRoomRequest } from "@/types/liveRoom";
import type { FieldErrors } from "react-hook-form";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreateLiveRoom } from "@/queries/liveRoomQueries";
import DateTimePicker from "./DateTimePicker";
import { getApiErrorMessage } from "@/lib/api-error";
type AddLiveRoomDialogProps = {
  classId: string;
  onSuccess?: () => void;
};

// Component chính
export default function AddLiveRoomDialog({
  classId,
  onSuccess,
}: AddLiveRoomDialogProps) {
  const t = useTranslations();
  const createLiveRoom = useCreateLiveRoom();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
  } = useForm<CreateLiveRoomFormData>({
    resolver: zodResolver(CreateLiveRoomSchema),
    defaultValues: {
      title: "",
      scheduledStartAt: "",
      scheduledEndAt: "",
      classId: parseInt(classId),
    },
  });

  const onSubmit = async (payload: CreateLiveRoomRequest) => {
    // console.log("Dữ liệu hợp lệ:", payload);
    try {
      await createLiveRoom.mutateAsync(payload);
      setOpen(false);
      reset();
      onSuccess?.();
      toast.success(t("create_successfully"));

    } catch (error) {
      toast.error(getApiErrorMessage(error, t("error_occurred"), t));
    }
  };

  const onError = (errors: FieldErrors<CreateLiveRoomFormData>) => {
    console.log("Validation errors:", errors);
  };

  const onVisible = (open: boolean) => {
    setOpen(open);
    if (!open) reset();
  };

  return (
    <Dialog open={open} onOpenChange={onVisible}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          {t("live_room_create_live_room")}
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
            <DialogTitle>{t("live_room_create_live_room")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                {t("live_room_title_label")}
                <span className="text-error ml-1">*</span>
              </Label>
              {errors.title && (
                <p className="text-sm text-error">{t(errors.title.message!)}</p>
              )}
              <Input
                id="title"
                placeholder={t("live_room_title_placeholder")}
                {...register("title")}
                className={cn(errors.title && "border-red-500")}
              />
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
              {t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
