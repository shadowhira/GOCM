'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { KeyRound, Copy, ClipboardCheck, Mail, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useInviteToClass } from '@/queries/classQueries'
import { getApiErrorMessage } from '@/lib/api-error'

interface InviteMembersModalProps {
  open: boolean
  onClose: () => void
  joinCode?: string
  classId: number
}

export const InviteMembersModal = ({ open, onClose, joinCode, classId }: InviteMembersModalProps) => {
  const t = useTranslations()
  const [copied, setCopied] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const { mutate: inviteToClass, isPending: isInviting } = useInviteToClass()

  const handleCopy = async () => {
    if (!joinCode) return

    try {
      await navigator.clipboard.writeText(joinCode)
      setCopied(true)
      toast.success(t('join_code_copied'))
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error(error)
      toast.error(t('copy_failed'))
    }
  }

  const handleInviteByEmail = () => {
    if (!inviteEmail.trim()) return

    inviteToClass(
      { classId, data: { email: inviteEmail.trim() } },
      {
        onSuccess: () => {
          toast.success(t('invite_sent_successfully'))
          setInviteEmail('')
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, t('invite_failed'), t))
        }
      }
    )
  }

  const instructions = [
    t('invite_step_share_code'),
    t('invite_step_send_link'),
    t('invite_step_support')
  ]

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) {
        onClose()
      }
    }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            {t('invite_members')}
          </DialogTitle>
          <DialogDescription>{t('invite_using_join_code')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite by Email Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('invite_by_email')}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t('enter_email_placeholder')}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inviteEmail.trim()) {
                    handleInviteByEmail()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleInviteByEmail}
                disabled={!inviteEmail.trim() || isInviting}
                className="gap-2"
              >
                {isInviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {t('send_invite')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('invite_by_email_description')}
            </p>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('or')}</span>
            </div>
          </div>

          {/* Join Code Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('share_this_code_to_invite')}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input value={joinCode ?? ''} readOnly className="font-mono text-lg" />
              <Button
                type="button"
                onClick={handleCopy}
                disabled={!joinCode}
                variant="outline"
                className="gap-2"
              >
                {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? t('copied') : t('copy_code')}
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-foreground">
              {t('invite_steps_title')}
            </p>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              {instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t('close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
