'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClassMembersPanel } from './sections/details/ClassMembersPanel'
import type { ClassResponse } from '@/types/class'
import { Calendar, Clipboard, ClipboardCheck, Users } from 'lucide-react'
import { toast } from 'sonner'

interface ClassDetailsSheetProps {
  open: boolean
  onClose: () => void
  classData?: ClassResponse
  classId?: number
  isLoading?: boolean
}

export const ClassDetailsSheet = ({ open, onClose, classData, classId, isLoading = false }: ClassDetailsSheetProps) => {
  const t = useTranslations()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!classData?.joinCode) {
      return
    }
    try {
      await navigator.clipboard.writeText(classData.joinCode)
      setCopied(true)
      toast.success(t('join_code_copied'))
      window.setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.error('copy failed', error)
      toast.error(t('copy_failed'))
    }
  }

  const renderOverview = () => {
    const createdAt = classData?.createdAt
      ? new Date(
          classData.createdAt.includes('Z') || classData.createdAt.includes('+')
            ? classData.createdAt
            : `${classData.createdAt}Z`
        ).toLocaleDateString()
      : undefined
    const memberCount = classData?.memberCount ?? 0
    const joinCode = classData?.joinCode ?? '—'

    if (!classData && !isLoading) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('no_class_selected')}
          </CardContent>
        </Card>
      )
    }

    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-lg border border-border bg-card p-4">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="mt-2 h-3 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{t('class_name')}</p>
              <p className="text-lg font-semibold text-foreground">{classData?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('description')}</p>
              <p className="text-sm text-foreground">
                {classData?.description || t('no_description_yet')}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 rounded-lg bg-muted/40 p-3">
              <Badge variant="outline" className="gap-2">
                <Users className="h-4 w-4" />
                {t('members_count', { count: memberCount })}
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {createdAt ? t('created_on', { date: createdAt }) : t('unknown')}
              </Badge>
            </div>
            <div className="rounded-lg border border-dashed border-border/60 p-4">
              <p className="text-sm font-medium text-muted-foreground">{t('join_code')}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-lg font-semibold tracking-wide">{joinCode}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleCopy}
                  disabled={!classData?.joinCode}
                >
                  {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                  {copied ? t('copied') : t('copy_code')}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t('class_join_code_description')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={(value) => !value && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="mb-4">
          <SheetTitle>{t('class_details')}</SheetTitle>
        </SheetHeader>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="overview">{t('class_overview')}</TabsTrigger>
            <TabsTrigger value="members">{t('class_members')}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">{renderOverview()}</TabsContent>
          <TabsContent value="members">
            <ClassMembersPanel classId={classId} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
