"use client"

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { CreateClassFormData } from '@/schemas/classSchema'

interface GeneralSettingsFormProps {
  form: UseFormReturn<CreateClassFormData>
  onSubmit: (values: CreateClassFormData) => Promise<void> | void
  isSaving: boolean
  isLoading: boolean
}

export const GeneralSettingsForm = ({ form, onSubmit, isSaving, isLoading }: GeneralSettingsFormProps) => {
  const t = useTranslations()
  const isDirty = form.formState.isDirty
  const isSubmitDisabled = isLoading || isSaving || !isDirty

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('general_settings')}</CardTitle>
        <CardDescription>
          {t('basic_class_configuration')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              {t('class_name')}
            </label>
            <Input id="name" placeholder={t('enter_class_name')} {...form.register('name')} />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-destructive">{t(form.formState.errors.name.message as string)}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="description">
              {t('class_description')}
            </label>
            <Textarea id="description" rows={4} placeholder={t('enter_class_description')} {...form.register('description')} />
            {form.formState.errors.description?.message ? (
              <p className="text-sm text-destructive">{t(form.formState.errors.description.message as string)}</p>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitDisabled}>
              <Save className="mr-2 h-4 w-4" />
              {t('save_changes')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
