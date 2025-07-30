import { useState, useCallback, useEffect } from 'react'
import { Notification } from '@/components/ui/enhanced-notification-center'
import { supabase } from '@/integrations/supabase/client'

// Demo notifications for now - in a real app these would come from a backend
const demoNotifications: Notification[] = [
  {
    id: '1',
    title: 'Purchase Order Approved',
    message: 'Purchase Order PO-000123 has been approved and is ready for sending.',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: false,
    category: 'purchase-order',
    actions: [
      { label: 'View PO', onClick: () => console.log('View PO clicked') },
      { label: 'Send to Supplier', onClick: () => console.log('Send clicked') }
    ]
  },
  {
    id: '2',
    title: 'New Supplier Added',
    message: 'Supplier "ABC Manufacturing" has been successfully added to the system.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    category: 'supplier'
  },
  {
    id: '3',
    title: 'Payment Overdue',
    message: 'Invoice INV-456 from XYZ Supplies is now 30 days overdue.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    category: 'approval',
    actions: [
      { label: 'View Invoice', onClick: () => console.log('View invoice clicked') },
      { label: 'Contact Supplier', onClick: () => console.log('Contact clicked') }
    ]
  },
  {
    id: '4',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur this weekend from 2 AM to 4 AM.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: true,
    category: 'system'
  },
  {
    id: '5',
    title: 'Delivery Delayed',
    message: 'Delivery for PO-000120 has been delayed by 3 days due to weather conditions.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: false,
    category: 'purchase-order'
  }
]

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }, [])

  const archive = useCallback((id: string) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  // Real-time notifications setup (for future implementation)
  useEffect(() => {
    // TODO: Set up real-time subscriptions for business events
    // Example:
    // const channel = supabase
    //   .channel('notifications')
    //   .on('postgres_changes', {
    //     event: 'UPDATE',
    //     schema: 'public',
    //     table: 'purchase_orders',
    //     filter: 'status=eq.approved'
    //   }, (payload) => {
    //     addNotification({
    //       title: 'Purchase Order Approved',
    //       message: `Purchase Order ${payload.new.po_number} has been approved`,
    //       type: 'success',
    //       category: 'purchase_orders',
    //       read: false
    //     })
    //   })
    //   .subscribe()

    // return () => {
    //   supabase.removeChannel(channel)
    // }
  }, [addNotification])

  return {
    notifications,
    unreadCount,
    markAsRead,
    archive,
    clearAll,
    addNotification
  }
}