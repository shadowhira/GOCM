'use client'

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterFormData } from "@/schemas/authSchema";
import { useRegister } from "@/queries/authQueries";
import { getApiErrorMessage } from "@/lib/api-error";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  className?: string;
}

export const RegisterForm = React.forwardRef<HTMLDivElement, RegisterFormProps>(
  ({ onSuccess, onSwitchToLogin, className }, ref) => {
    const t = useTranslations();
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const registerMutation = useRegister();

    const errorMessage = React.useMemo(
      () =>
        getApiErrorMessage(registerMutation.error, t("register_failed"), t),
      [registerMutation.error, t]
    );

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
      try {
        await registerMutation.mutateAsync({
          email: data.email,
          password: data.password,
          displayName: data.displayName,
        });
        onSuccess?.();
      } catch (error) {
        // Error handling is managed by the mutation
        console.error("Register error:", error);
      }
    };

    return (
      <Card ref={ref} className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">
            {t("join_us_today")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("create_your_account")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Display Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="text-sm font-medium text-foreground"
              >
                {t("display_name")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder={t("display_name")}
                  className={cn(
                    "pl-10",
                    errors.displayName && "border-error focus:ring-error"
                  )}
                  {...register("displayName")}
                />
              </div>
              {errors.displayName && (
                <p className="text-sm text-error">
                  {t(errors.displayName.message || "display_name_required")}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("email")}
                  className={cn(
                    "pl-10",
                    errors.email && "border-error focus:ring-error"
                  )}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-error">
                  {t(errors.email.message || "email_invalid")}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password")}
                  className={cn(
                    "pl-10 pr-10",
                    errors.password && "border-error focus:ring-error"
                  )}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-error">
                  {t(errors.password.message || "password_required")}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                {t("confirm_password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("confirm_password")}
                  className={cn(
                    "pl-10 pr-10",
                    errors.confirmPassword && "border-error focus:ring-error"
                  )}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-error">
                  {t(
                    errors.confirmPassword.message ||
                      "confirm_password_required"
                  )}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting || registerMutation.isPending}
            >
              {registerMutation.isPending
                ? t("creating_account")
                : t("create_account")}
            </Button>

            {/* Error Message */}
            {registerMutation.isError && (
              <div className="p-3 rounded-md bg-error/10 border border-error/20">
                <p className="text-sm text-error text-center">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Switch to Login */}
            {onSwitchToLogin && (
              <div className="text-center text-sm text-muted-foreground">
                {t("already_have_account")}{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
                >
                  {t("sign_in")}
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }
);

RegisterForm.displayName = "RegisterForm";
