'use client'

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

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
import { loginSchema, type LoginFormData } from "@/schemas/authSchema";
import { useLogin } from "@/queries/authQueries";
import { getApiErrorMessage } from "@/lib/api-error";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  onForgotPassword?: () => void;
  className?: string;
}

export const LoginForm = React.forwardRef<HTMLDivElement, LoginFormProps>(
  ({ onSuccess, onSwitchToRegister, onForgotPassword, className }, ref) => {
    const t = useTranslations();
    const [showPassword, setShowPassword] = React.useState(false);

    const loginMutation = useLogin();

    const quickLogin = useLogin();
  
    const demoAccount = React.useMemo(
      () => ({ email: 'thanhoc890@gmail.com', password: '123456' }),
      []
    );

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
      resolver: zodResolver(loginSchema),
    });

    const errorMessage = React.useMemo(
      () => getApiErrorMessage(loginMutation.error, t("login_failed"), t),
      [loginMutation.error, t]
    );

    const onSubmit = async (data: LoginFormData) => {
      try {
        await loginMutation.mutateAsync({
          email: data.email,
          password: data.password,
        });
        onSuccess?.();
      } catch (error) {
        // Error handling is managed by the mutation
        console.error("Login error:", error);
      }
    };

    const handleQuickLogin = async () => {
      try {
        await quickLogin.mutateAsync(demoAccount);
        onSuccess?.();
      } catch (error) {
        console.error('Quick login error:', error);
      }
    };

    return (
      <Card ref={ref} className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">
            {t("welcome_back")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("sign_in_to_continue")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                {t("forgot_password")}
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting || loginMutation.isPending}
            >
              {loginMutation.isPending ? t("signing_in") : t("sign_in")}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={quickLogin.isPending}
              onClick={handleQuickLogin}
            >
              {quickLogin.isPending? t("signing_in") : t("quick_sign_in")}
            </Button>

            {/* Error Message */}
            {loginMutation.isError && (
              <div className="p-3 rounded-md bg-error/10 border border-error/20">
                <p className="text-sm text-error text-center">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Switch to Register */}
            {onSwitchToRegister && (
              <div className="text-center text-sm text-muted-foreground">
                {t("dont_have_account")}{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
                >
                  {t("sign_up")}
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }
);

LoginForm.displayName = "LoginForm";
