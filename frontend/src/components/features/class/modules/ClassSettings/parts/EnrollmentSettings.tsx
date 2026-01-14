"use client"

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { KeyRound, Copy } from 'lucide-react'

interface EnrollmentSettingsProps {
  joinCode?: string
  onCopyJoinCode: () => void
}

export const EnrollmentSettings = ({ joinCode, onCopyJoinCode }: EnrollmentSettingsProps) => {
  const t = useTranslations()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          {t('enrollment')}
        </CardTitle>
        <CardDescription>
          {t('manage_join_code_and_access')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 md:items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="joinCode">
              {t('join_code')}
            </label>
            <Input id="joinCode" value={joinCode ?? ''} readOnly />
            <p className="text-xs text-muted-foreground">{t('share_this_code_to_invite')}</p>
          </div>
          <div className="flex gap-2 md:justify-end">
            <Button variant="outline" onClick={onCopyJoinCode} disabled={!joinCode}>
              <Copy className="mr-2 h-4 w-4" />
              {t('copy_code')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
