"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileUpload } from "@/components/features/uploadFile/FileUpload";
import { useUpdateUserProfile } from "@/queries/userQueries";
import { useCurrentUser, useUpdateUser } from "@/store/auth";
import type { UploadAvatarResponse } from "@/types/user";
import { adminKeys } from "@/queries/adminQueries";
import { userKeys } from "@/queries/userQueries";

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "display_name_min_length")
    .max(50, "display_name_max_length"),
  email: z.string().email("email_invalid"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export const ProfileSettingsPanel = () => {
  const t = useTranslations();
  const user = useCurrentUser();
  const updateUserStore = useUpdateUser();
  const { mutateAsync: updateProfile, isPending } = useUpdateUserProfile();
  const queryClient = useQueryClient();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
    },
  });

  const { formState, register, handleSubmit, reset } = form;
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");

  useEffect(() => {
    reset({
      displayName: user?.displayName || "",
      email: user?.email || "",
    });
    setAvatarUrl(user?.avatarUrl || "");
  }, [user?.displayName, user?.email, user?.avatarUrl, reset]);

  const onSubmit = async (values: ProfileForm) => {
    try {
      const updatedUser = await updateProfile(values);
      updateUserStore(updatedUser);
      setAvatarUrl(updatedUser?.avatarUrl || "");
      reset({
        displayName: updatedUser?.displayName || "",
        email: updatedUser?.email || "",
      });
      toast.success(t("profile_updated"));
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t("profile")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("update_profile_information")}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("avatar")}</label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-1">
            <Avatar className="h-16 w-16">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={user?.displayName || "Avatar"} />
              ) : null}
              <AvatarFallback>
                {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <FileUpload
              key={avatarUrl || "avatar-uploader"}
              className="w-full max-w-sm"
              action="/User/me/avatar"
              accept="image/*"
              showPreview={false}
              onUploaded={(response) => {
                const data = response as UploadAvatarResponse;
                if (!data?.avatarUrl) return;
                setAvatarUrl(data.avatarUrl);
                updateUserStore({ avatarUrl: data.avatarUrl });
                queryClient.invalidateQueries({ queryKey: userKeys.me() });
                queryClient.invalidateQueries({ queryKey: adminKeys.users() });
              }}
              onError={(error) => {
                console.error("Avatar upload failed:", error);
                toast.error("Failed to upload avatar");
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="displayName">
            {t("display_name")}
          </label>
          <Input id="displayName" {...register("displayName")} />
          {formState.errors.displayName?.message ? (
            <p className="text-sm text-destructive">
              {t(formState.errors.displayName.message as string)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            {t("email")}
          </label>
          <Input id="email" type="email" {...register("email")} />
          {formState.errors.email?.message ? (
            <p className="text-sm text-destructive">
              {t(formState.errors.email.message as string)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending || !formState.isDirty}>
            {t("save_changes")}
          </Button>
        </div>
      </form>
    </div>
  );
};
