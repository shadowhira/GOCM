"use client"

import React, { useState } from 'react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown, Copy, Check, Users, Key } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Default cover gradient
const DEFAULT_COVER_GRADIENT = 'linear-gradient(100deg, #3b82f6, #22d3ee)'

interface ClassInfo {
  id: number
  name: string
  description?: string
  joinCode?: string
  memberCount: number
  coverImageUrl?: string
  coverColor?: string
  teacherName?: string
  teacherAvatarUrl?: string
}

interface ClassDropdownProps {
  classInfo: ClassInfo
}

export const ClassDropdown = ({ classInfo }: ClassDropdownProps) => {
  const t = useTranslations()
  const [copied, setCopied] = useState(false)

  const handleCopyJoinCode = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!classInfo.joinCode) return

    try {
      await navigator.clipboard.writeText(classInfo.joinCode)
      setCopied(true)
      toast.success(t('join_code_copied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('copy_failed'))
    }
  }

  const teacherInitial = classInfo.teacherName?.charAt(0)?.toUpperCase() || 'T'
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 h-auto",
            "w-full max-w-full"
          )}
        >
          {/* Class Name and Member Count */}
          <div className="text-left min-w-0 flex-1">
            <div className="font-medium text-xs sm:text-sm text-primary-500 truncate">
              {classInfo.name}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {t('members_count', { count: classInfo.memberCount })}
            </div>
          </div>
          
          <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="start" className="w-80 p-0 overflow-hidden">
        {/* Cover Section with Teacher Overlay */}
        <div className="relative h-28">
          {/* Background */}
          {classInfo.coverImageUrl ? (
            <Image 
              src={classInfo.coverImageUrl} 
              alt={classInfo.name}
              fill
              className="object-cover"
              sizes="320px"
            />
          ) : (
            <div 
              className="absolute inset-0" 
              style={{ background: classInfo.coverColor || DEFAULT_COVER_GRADIENT }}
            />
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
          
          {/* Teacher Info on Cover */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Avatar className="h-10 w-10 border-2 border-background shadow-md">
              <AvatarImage src={classInfo.teacherAvatarUrl} alt={classInfo.teacherName} />
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {teacherInitial}
              </AvatarFallback>
            </Avatar>
            <div className="text-background">
              <p className="text-sm font-semibold drop-shadow-md">
                {classInfo.teacherName || t('teacher')}
              </p>
              <p className="text-xs opacity-90 drop-shadow-sm">{t('teacher')}</p>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4 space-y-3">
          {/* Class Name & Description */}
          <div>
            <h3 className="font-semibold text-base text-foreground line-clamp-1">
              {classInfo.name}
            </h3>
            {classInfo.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {classInfo.description}
              </p>
            )}
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="secondary" className="gap-1.5 font-normal">
              <Users className="h-3.5 w-3.5" />
              {classInfo.memberCount} {t('members')}
            </Badge>
          </div>
          
          {/* Join Code with Copy Button */}
          {classInfo.joinCode && (
            <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-2 text-sm min-w-0">
                <Key className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{t('join_code')}:</span>
                <code className="font-mono font-semibold text-foreground">
                  {classInfo.joinCode}
                </code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyJoinCode}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}