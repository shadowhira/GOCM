import React from 'react'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, Clock, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import type { ClassResponse } from '@/types/class'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Default cover gradient
const DEFAULT_COVER_GRADIENT = 'linear-gradient(100deg, #3b82f6, #22d3ee)'

interface DashboardClassCardProps {
  classData: ClassResponse
  onEnterClass: (classId: number) => void
  className?: string
}

export const DashboardClassCard = ({ 
  classData, 
  onEnterClass, 
  className 
}: DashboardClassCardProps) => {
  const t = useTranslations()

  // Render cover background (image, color/gradient, or default)
  const renderCoverBackground = () => {
    if (classData.coverImageUrl) {
      return (
        <Image
          src={classData.coverImageUrl}
          alt={classData.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )
    }
    if (classData.coverColor) {
      return (
        <div 
          className="absolute inset-0" 
          style={{ background: classData.coverColor }}
        />
      )
    }
    // Default gradient
    return (
      <div 
        className="absolute inset-0" 
        style={{ background: DEFAULT_COVER_GRADIENT }}
      />
    )
  }

  const pendingCount = classData.pendingAssignmentsCount ?? 0
  const isStudent = classData.userRoleInClass === 1
  
  // Format next deadline
  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null
    const date = new Date(deadline)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) return t('deadline_tomorrow')
    if (diffDays <= 7) return t('deadline_in_days', { days: diffDays })
    return date.toLocaleDateString()
  }

  return (
    <Card className={cn(
      "group overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col",
      className
    )}>
      {/* Cover Section with Avatar overlay */}
      <div className="relative h-36 shrink-0">
        {/* Background */}
        {renderCoverBackground()}
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        
        {/* Role Badge - Top right */}
        <Badge 
          variant={classData.userRoleInClass === 0 ? 'accent' : 'primary'}
          className="absolute top-3 right-3 backdrop-blur-sm text-primary-100"
        >
          {classData.userRoleInClass === 0 ? t('teacher') : t('student')}
        </Badge>
        
        {/* Teacher Info - Bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <Avatar className="h-8 w-8 border-1 border-background">
            <AvatarImage src={classData.createdByUserAvatarUrl || undefined} alt={classData.createdByUserName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {classData.createdByUserName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-background text-sm font-medium drop-shadow-md">
            {classData.createdByUserName}
          </span>
        </div>
      </div>

      {/* Content - flex-1 to fill remaining space */}
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Title & Description - fixed height area */}
        <div className="min-h-18">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {classData.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {classData.description || t('no_description_yet')}
          </p>
        </div>
        
        {/* Stats - fixed position */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-3">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {classData.memberCount} {t('members')}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(
              classData.createdAt.includes('Z') || classData.createdAt.includes('+') 
                ? classData.createdAt 
                : classData.createdAt + 'Z'
            ).toLocaleDateString('en-GB')}
          </span>
        </div>

        {/* Deadline Info - Only for students, fixed height */}
        <div className="pt-3 mt-2 border-t min-h-11 flex items-center">
          {isStudent ? (
            pendingCount > 0 ? (
              <div className="space-y-1">
                <Badge variant="pending" className="text-xs back">
                  <Clock className="h-3 w-3 mr-1" />
                  {t('pending_assignments_count', { count: pendingCount })}
                </Badge>
                {classData.nextDeadline && (
                  <p className="text-xs text-muted-foreground">
                    {t('next_deadline')}: {formatDeadline(classData.nextDeadline)}
                  </p>
                )}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-success" />
                {t('no_pending_deadlines')}
              </span>
            )
          ) : (
            <span className="text-xs text-muted-foreground">
              {t('teacher_view_hint')}
            </span>
          )}
        </div>
      </CardContent>

      {/* Action - always at bottom */}
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button 
          onClick={() => onEnterClass(classData.id)}
          className="w-full"
          variant="primary"
        >
          {t('enter_class')}
        </Button>
      </CardFooter>
    </Card>
  )
}