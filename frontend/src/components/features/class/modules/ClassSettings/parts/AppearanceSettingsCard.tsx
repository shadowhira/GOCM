'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useGetClassAppearanceSettings, useUpdateClassAppearanceSettings } from '@/queries/classQueries'
import { useClassAppearanceSettings, useSetClassAppearanceSettings } from '@/store'

interface AppearanceSettingsCardProps {
  classId: number
  isTeacher: boolean
}

interface AppearanceSettingsState {
  showAvatarFrames: boolean
  showChatFrames: boolean
  showBadges: boolean
}

const defaultState: AppearanceSettingsState = {
  showAvatarFrames: true,
  showChatFrames: true,
  showBadges: true,
}

export const AppearanceSettingsCard = ({ classId, isTeacher }: AppearanceSettingsCardProps) => {
  const t = useTranslations()
  const { data, isLoading, isFetching } = useGetClassAppearanceSettings(classId)
  const { mutateAsync: updateSettings, isPending } = useUpdateClassAppearanceSettings(classId)
  const storedSettings = useClassAppearanceSettings(classId)
  const setClassAppearanceSettings = useSetClassAppearanceSettings()
  const [localSettings, setLocalSettings] = useState<AppearanceSettingsState>(defaultState)

  const effectiveSettings = storedSettings ?? data

  useEffect(() => {
    if (classId && data) {
      setClassAppearanceSettings(classId, data)
    }
  }, [classId, data, setClassAppearanceSettings])

  useEffect(() => {
    if (effectiveSettings) {
      setLocalSettings({
        showAvatarFrames: effectiveSettings.showAvatarFrames,
        showChatFrames: effectiveSettings.showChatFrames,
        showBadges: effectiveSettings.showBadges,
      })
    }
  }, [effectiveSettings])

  const hasChanges = useMemo(() => {
    if (!effectiveSettings) {
      return false
    }

    return (
      effectiveSettings.showAvatarFrames !== localSettings.showAvatarFrames ||
      effectiveSettings.showChatFrames !== localSettings.showChatFrames ||
      effectiveSettings.showBadges !== localSettings.showBadges
    )
  }, [effectiveSettings, localSettings])

  const handleToggle = (field: keyof AppearanceSettingsState) => (checked: boolean) => {
    if (!isTeacher) {
      return
    }

    setLocalSettings((prev) => ({
      ...prev,
      [field]: checked,
    }))
  }

  const handleSubmit = async () => {
    try {
      const updated = await updateSettings(localSettings)
      setClassAppearanceSettings(classId, updated)
      toast.success(t('appearance_settings_updated'))
    } catch {
      toast.error(t('appearance_settings_update_failed'))
    }
  }

  const updatedAtLabel = useMemo(() => {
    if (!effectiveSettings?.updatedAt) {
      return null
    }

    try {
      const formatted = new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(effectiveSettings.updatedAt))
      return formatted
    } catch {
      return null
    }
  }, [effectiveSettings?.updatedAt])

  if (isLoading && !effectiveSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('appearance_settings_title')}</CardTitle>
          <CardDescription>
            {t('appearance_settings_subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  const toggleDefinitions: Array<{
    field: keyof AppearanceSettingsState
    label: string
    description: string
  }> = [
    {
      field: 'showAvatarFrames',
      label: t('appearance_toggle_avatar'),
      description: t('appearance_toggle_avatar_desc'),
    },
    {
      field: 'showChatFrames',
      label: t('appearance_toggle_chat'),
      description: t('appearance_toggle_chat_desc'),
    },
    {
      field: 'showBadges',
      label: t('appearance_toggle_badge'),
      description: t('appearance_toggle_badge_desc'),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t('appearance_settings_title')}
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden />}
        </CardTitle>
        <CardDescription>
          {t('appearance_settings_subtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4">
          {toggleDefinitions.map((toggle) => (
            <div key={toggle.field} className="flex flex-col gap-3 rounded-md border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                <p className="text-xs text-muted-foreground">{toggle.description}</p>
              </div>
              <Switch
                checked={localSettings[toggle.field]}
                onCheckedChange={handleToggle(toggle.field)}
                disabled={!isTeacher || isPending}
                aria-label={toggle.label}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-dashed pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {updatedAtLabel
              ? t('appearance_settings_updated_at', { time: updatedAtLabel })
              : t('appearance_settings_not_updated')}
          </p>
          {isTeacher && (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!hasChanges || isPending}
              className="sm:w-auto"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('save_changes')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
