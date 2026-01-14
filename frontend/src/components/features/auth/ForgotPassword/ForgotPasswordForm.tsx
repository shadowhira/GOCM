'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas/authSchema';
import { useForgotPassword } from '@/queries/authQueries';
import { getApiErrorMessage } from '@/lib/api-error';

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
  className?: string;
}

export const ForgotPasswordForm = React.forwardRef<HTMLDivElement, ForgotPasswordFormProps>(
  ({ onBackToLogin, className }, ref) => {
    const t = useTranslations();
    const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null);

    const mutation = useForgotPassword();

    const errorMessage = React.useMemo(
      () => getApiErrorMessage(mutation.error, t('reset_link_failed'), t),
      [mutation.error, t]
    );

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
    } = useForm<ForgotPasswordFormData>({
      resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (values: ForgotPasswordFormData) => {
      try {
        await mutation.mutateAsync(values);
        setSubmittedEmail(values.email);
        reset({ email: values.email });
      } catch (error) {
        console.error('Forgot password error:', error);
      }
    };

    return (
      <Card ref={ref} className={cn('w-full max-w-md mx-auto', className)}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold text-foreground">
            {t('reset_password')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('reset_password_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('email')}
                  className={cn('pl-10', errors.email && 'border-error focus:ring-error')}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-error">{t(errors.email.message || 'email_invalid')}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting || mutation.isPending}
            >
              {mutation.isPending ? t('requesting_reset_link') : t('send_reset_link')}
            </Button>

            {mutation.isError && (
              <div className="p-3 rounded-md bg-error/10 border border-error/20">
                <p className="text-sm text-error text-center">{errorMessage}</p>
              </div>
            )}

            {submittedEmail && mutation.isSuccess && (
              <div className="p-3 rounded-md bg-success/10 border border-success/20">
                <p className="text-sm text-success text-center">
                  {t('reset_link_sent', { email: submittedEmail })}
                </p>
              </div>
            )}

            {onBackToLogin && (
              <div className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
                >
                  {t('back_to_login')}
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }
);

ForgotPasswordForm.displayName = 'ForgotPasswordForm';
