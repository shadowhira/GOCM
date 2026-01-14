import { z } from "zod";

export const CreateLiveRoomSchema = z
  .object({
    title: z.string().trim().min(1, "live_room_title_required_field"),
    scheduledStartAt: z.iso.datetime({
      message: "live_room_invalid_start_time",
    }),
    scheduledEndAt: z.iso.datetime({
      message: "live_room_invalid_end_time",
    }),
    classId: z.number(),
  })
  .refine(
    (data) =>
      new Date(data.scheduledEndAt).getTime() >
      new Date(data.scheduledStartAt).getTime(),
    {
      message: "live_room_end_time_after_start_time",
      path: ["scheduledEndAt"],
    }
  );

export const UpdateLiveRoomSchema = z
  .object({
    id: z.number(),
    title: z.string().trim().min(1, "live_room_title_required_field"),
    scheduledStartAt: z.iso.datetime({
      message: "live_room_invalid_start_time",
    }),
    scheduledEndAt: z.iso.datetime({
      message: "live_room_invalid_end_time",
    }),
  })
  .refine(
    (data) =>
      new Date(data.scheduledEndAt).getTime() >
      new Date(data.scheduledStartAt).getTime(),
    {
      message: "live_room_end_time_after_start_time",
      path: ["scheduledEndAt"],
    }
  );

export type CreateLiveRoomFormData = z.infer<typeof CreateLiveRoomSchema>;
export type UpdateLiveRoomFormData = z.infer<typeof UpdateLiveRoomSchema>;
