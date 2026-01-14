'use client'

import { Separator } from '@/components/ui/separator'
import { UserAvatar } from './UserAvatar'
import { UserInfo } from './UserInfo'
import { UserClassInfo } from './UserClassInfo'
import type { UserDetailContentProps } from './types'

export const UserDetailContent = ({ user, classContext }: UserDetailContentProps) => {
  return (
    <div className="flex flex-col items-center space-y-4 py-2">
      {/* Avatar Section */}
      <UserAvatar user={user} classContext={classContext} size="xl" />

      {/* User Info Section */}
      <UserInfo user={user} classContext={classContext} />

      {/* Class Info Section (only if in class context) */}
      {classContext && (
        <>
          <Separator className="my-2" />
          <UserClassInfo classContext={classContext} />
        </>
      )}
    </div>
  )
}
