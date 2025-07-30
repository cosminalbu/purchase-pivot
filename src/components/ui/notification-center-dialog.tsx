import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NotificationCenter, Notification } from '@/components/ui/enhanced-notification-center'
import { Bell, BellRing } from 'lucide-react'

interface NotificationCenterDialogProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onArchive: (id: string) => void
  onClearAll: () => void
  unreadCount?: number
}

export const NotificationCenterDialog: React.FC<NotificationCenterDialogProps> = ({
  notifications,
  onMarkAsRead,
  onArchive,
  onClearAll,
  unreadCount = 0
}) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary">
                {unreadCount} unread
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={() => {
            notifications.forEach(n => {
              if (!n.read) onMarkAsRead(n.id)
            })
          }}
          onArchive={onArchive}
          onClearAll={onClearAll}
        />
      </DialogContent>
    </Dialog>
  )
}