"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { userApi } from "@/api/userApi";
import type { ChangePasswordRequest } from "@/types/user";
import { getApiErrorMessage } from "@/lib/api-error";

const passwordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "current_password_required"),
  newPassword: z
    .string()
    .min(6, "password_min_length"),
  confirmPassword: z
    .string()
    .min(1, "confirm_password_required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "passwords_do_not_match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "new_password_same_as_current",
  path: ["newPassword"],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export const SecuritySettingsPanel = () => {
  const t = useTranslations();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { formState, register, handleSubmit, reset } = form;

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
    onSuccess: () => {
      toast.success(t("password_changed_successfully"));
      reset();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, t("something_went_wrong"), t));
    },
  });

  const onSubmit = (values: PasswordForm) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t("security")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("manage_your_password")}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{t("change_password")}</p>
            <p className="text-xs text-muted-foreground">{t("change_password_description")}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="currentPassword">
            {t("current_password")}
          </label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              {...register("currentPassword")}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {formState.errors.currentPassword?.message ? (
            <p className="text-sm text-destructive">
              {t(formState.errors.currentPassword.message as string)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="newPassword">
            {t("new_password")}
          </label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword")}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {formState.errors.newPassword?.message ? (
            <p className="text-sm text-destructive">
              {t(formState.errors.newPassword.message as string)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirmPassword">
            {t("confirm_new_password")}
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {formState.errors.confirmPassword?.message ? (
            <p className="text-sm text-destructive">
              {t(formState.errors.confirmPassword.message as string)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={changePasswordMutation.isPending || !formState.isDirty}
          >
            {changePasswordMutation.isPending ? t("saving") : t("change_password")}
          </Button>
        </div>
      </form>
    </div>
  );
};
