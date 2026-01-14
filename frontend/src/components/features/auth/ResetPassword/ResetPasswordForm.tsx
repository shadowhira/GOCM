'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/authSchema';
import { useResetPassword } from '@/queries/authQueries';
import { getApiErrorMessage } from '@/lib/api-error';

interface ResetPasswordFormProps {
  token?: string;
  onBackToLogin?: () => void;
  onBackToForgotPassword?: () => void;
  className?: string;
}

export const ResetPasswordForm = React.forwardRef<HTMLDivElement, ResetPasswordFormProps>(
  ({ token, onBackToLogin, onBackToForgotPassword, className }, ref) => {
    const t = useTranslations();
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [isCompleted, setIsCompleted] = React.useState(false);

    const mutation = useResetPassword();

    const errorMessage = React.useMemo(
      () => getApiErrorMessage(mutation.error, t('password_reset_failed'), t),
      [mutation.error, t]
    );

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
    } = useForm<ResetPasswordFormData>({
      resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (values: ResetPasswordFormData) => {
      if (!token) {
        return;
      }

      try {
        await mutation.mutateAsync({ token, newPassword: values.password });
        setIsCompleted(true);
        reset({ password: '', confirmPassword: '' });
      } catch (error) {
        console.error('Reset password error:', error);
      }
    };

    if (!token) {
      return (
        <Card ref={ref} className={cn('w-full max-w-md mx-auto', className)}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold text-foreground">
              {t('reset_password')}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('reset_token_invalid_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {onBackToForgotPassword && (
              <Button type="button" variant="primary" className="w-full" onClick={onBackToForgotPassword}>
                {t('request_new_reset_link')}
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">
            {t('create_new_password')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('create_new_password_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isCompleted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  {t('new_password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('new_password')}
                    className={cn('pl-10 pr-10', errors.password && 'border-error focus:ring-error')}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-error">{t(errors.password.message || 'password_required')}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  {t('confirm_new_password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('confirm_new_password')}
                    className={cn('pl-10 pr-10', errors.confirmPassword && 'border-error focus:ring-error')}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-error">
                    {t(errors.confirmPassword.message || 'confirm_password_required')}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting || mutation.isPending}
              >
                {mutation.isPending ? t('updating_password') : t('update_password')}
              </Button>

              {mutation.isError && (
                <div className="p-3 rounded-md bg-error/10 border border-error/20">
                  <p className="text-sm text-error text-center">{errorMessage}</p>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="p-3 rounded-md bg-success/10 border border-success/20">
                <p className="text-sm text-success">{t('password_reset_success')}</p>
              </div>
              {onBackToLogin && (
                <Button type="button" variant="primary" className="w-full" onClick={onBackToLogin}>
                  {t('back_to_login')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

ResetPasswordForm.displayName = 'ResetPasswordForm';
