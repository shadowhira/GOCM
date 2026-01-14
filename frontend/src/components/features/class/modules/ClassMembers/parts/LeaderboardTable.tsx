'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar, Mail, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ClassMemberResponse, RoleInClass } from '@/types/class'
import { CosmeticAvatar, CosmeticBadge } from '@/components/features/cosmetics'
import {
  UserDetailModal,
  ClickableAvatarWrapper,
  useUserDetailModal,
  type UserBasicInfo,
  type UserClassContext,
} from '@/components/features/user'

export interface LeaderboardEntry extends ClassMemberResponse {
  rank: number
}

interface LeaderboardTableProps {
  members: LeaderboardEntry[]
  currentUserId?: number
  currentUserEntry?: LeaderboardEntry | null
  classId: number
}

const getRowHighlight = (rank: number) => {
  if (rank === 1) return 'bg-accent-50 dark:bg-accent-500/15'
  if (rank === 2) return 'bg-secondary-50 dark:bg-secondary-500/15'
  if (rank === 3) return 'bg-primary-50 dark:bg-primary-500/15'
  if (rank >= 4 && rank <= 10) return 'bg-muted dark:bg-muted/30'
  return ''
}

const getRankBadgeClass = (rank: number) => {
  if (rank === 1) {
    return 'bg-accent-100 text-accent-900 border-accent-100/60 dark:bg-accent-500/20 dark:text-accent-500 dark:border-accent-500/30'
  }
  if (rank === 2) {
    return 'bg-secondary-100 text-secondary-900 border-secondary-100/60 dark:bg-secondary-500/20 dark:text-secondary-500 dark:border-secondary-500/30'
  }
  if (rank === 3) {
    return 'bg-primary-100 text-primary-900 border-primary-100/60 dark:bg-primary-500/20 dark:text-primary-500 dark:border-primary-500/30'
  }
  if (rank >= 4 && rank <= 10) {
    return 'bg-primary-50 text-primary-700 border-primary-100/40 dark:bg-primary-500/10 dark:text-primary-500 dark:border-primary-500/20'
  }
  return 'bg-muted text-muted-foreground border-border/60 dark:bg-muted/50 dark:text-muted-foreground dark:border-border/40'
}

export const LeaderboardTable = ({ members, currentUserId, currentUserEntry, classId }: LeaderboardTableProps) => {
  const t = useTranslations()
  const { isOpen, selectedUser, classContext, openModal, setIsOpen } = useUserDetailModal()

  const podium = useMemo(() => members.slice(0, 3), [members])

  const handleAvatarClick = (entry: LeaderboardEntry) => {
    const userBasicInfo: UserBasicInfo = {
      id: entry.userId,
      displayName: entry.userName,
      email: entry.userEmail,
      avatarUrl: entry.avatarUrl,
    }

    const userClassContext: UserClassContext = {
      classId,
      classMemberId: entry.id,
      roleInClass: entry.roleInClassValue as RoleInClass,
      roleInClassLabel: entry.roleInClass,
      points: entry.points ?? 0,
      enrollDate: entry.enrollDate,
      cosmetics: entry.cosmetics,
    }

    openModal(userBasicInfo, userClassContext)
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary-600 dark:text-primary-300" />
            {t('leaderboard')}
          </CardTitle>
          <CardDescription>{t('no_points_yet')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('invite_using_join_code')}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {currentUserEntry && (
        <Card>
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary-600 dark:text-primary-300" />
              {t('your_rank_position', { rank: currentUserEntry.rank })}
            </div>
            <p className="text-lg font-semibold text-foreground">
              {currentUserEntry.points ?? 0} {t('points')}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary-600 dark:text-primary-300" />
            {t('leaderboard')}
          </CardTitle>
          <CardDescription>
            {t('leaderboard_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {podium.length > 0 && (
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              {podium.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    'rounded-2xl border p-4 shadow-sm',
                    getRowHighlight(entry.rank)
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Badge className={cn('text-sm', getRankBadgeClass(entry.rank))}>
                      #{entry.rank}
                    </Badge>
                    <ClickableAvatarWrapper onClick={() => handleAvatarClick(entry)}>
                      <CosmeticAvatar
                        classId={classId}
                        classMemberId={entry.id}
                        avatarUrl={entry.avatarUrl}
                        displayName={entry.userName}
                        size="lg"
                        cosmetics={entry.cosmetics ?? null}
                      />
                    </ClickableAvatarWrapper>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{entry.userName}</p>
                        <CosmeticBadge
                          classId={classId}
                          classMemberId={entry.id}
                          cosmetics={entry.cosmetics ?? null}
                          fallbackLabel={entry.roleInClass}
                          size="sm"
                          showWhenDisabled
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.points ?? 0} {t('points')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">{t('rank')}</TableHead>
                <TableHead>{t('member')}</TableHead>
                <TableHead className="w-28 text-right">{t('points')}</TableHead>
                <TableHead className="hidden md:table-cell w-48">{t('enrolled_date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const highlight = getRowHighlight(member.rank)
                const isCurrentUser = member.userId === currentUserId

                return (
                  <TableRow
                    key={member.id}
                    className={cn(
                      'hover:bg-muted/60 dark:hover:bg-muted/30 transition-colors',
                      highlight,
                      isCurrentUser && 'ring-1 ring-primary-200 dark:ring-primary-500/40'
                    )}
                  >
                    <TableCell>
                      <Badge className={cn('text-sm', getRankBadgeClass(member.rank))}>
                        #{member.rank}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ClickableAvatarWrapper onClick={() => handleAvatarClick(member)}>
                          <CosmeticAvatar
                            classId={classId}
                            classMemberId={member.id}
                            avatarUrl={member.avatarUrl}
                            displayName={member.userName}
                            size="md"
                            cosmetics={member.cosmetics ?? null}
                          />
                        </ClickableAvatarWrapper>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-foreground">{member.userName}</p>
                              <CosmeticBadge
                                classId={classId}
                                classMemberId={member.id}
                                cosmetics={member.cosmetics ?? null}
                                fallbackLabel={member.roleInClass}
                                size="sm"
                                showWhenDisabled
                              />
                            </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{member.userEmail}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {member.points ?? 0}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(member.enrollDate + 'Z').toLocaleDateString('vi-VN')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          classContext={classContext}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      )}
    </div>
  )
}
