"use client"

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrentLocale, useSetLocale } from '@/store/locale/useLocaleStore'
import { useCurrentTheme, useSetTheme } from '@/store/theme/useThemeStore'
import type { SupportedLocale } from '@/config/locales'
import type { SupportedTheme } from '@/config/themes'

export const SystemSettingsPanel = () => {
  const t = useTranslations()
  const currentTheme = useCurrentTheme()
  const setTheme = useSetTheme()
  const locale = useCurrentLocale()
  const setLocale = useSetLocale()

  const handleLocaleChange = (value: string) => setLocale(value as SupportedLocale)
  const handleThemeChange = (theme: SupportedTheme) => setTheme(theme)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t('system')}</h2>
        <p className="text-sm text-muted-foreground">{t('system_preferences_description')}</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('language')}</label>
        <Select value={locale} onValueChange={handleLocaleChange}>
          <SelectTrigger className="w-60">
            <SelectValue placeholder={t('language')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="vi">Tiếng Việt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('theme')}</label>
        <div className="flex gap-2">
          <Button 
            variant={currentTheme === 'light' ? 'default' : 'outline'} 
            onClick={() => handleThemeChange('light')}
          >
            {t('light')}
          </Button>
          <Button 
            variant={currentTheme === 'dark' ? 'default' : 'outline'} 
            onClick={() => handleThemeChange('dark')}
          >
            {t('dark')}
          </Button>
        </div>
      </div>
    </div>
  )
}

