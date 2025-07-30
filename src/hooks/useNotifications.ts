import { useRealTimeNotifications, DatabaseNotification } from './useRealTimeNotifications'
import { Notification } from '@/components/ui/enhanced-notification-center'

// Convert database notification to UI notification format
const convertToUINotification = (dbNotification: DatabaseNotification): Notification => ({
  id: dbNotification.id,
  title: dbNotification.title,
  message: dbNotification.message,
  type: dbNotification.type,
  timestamp: new Date(dbNotification.created_at),
  read: dbNotification.read,
  category: dbNotification.category,
  actions: dbNotification.metadata?.actions || []
})

export const useNotifications = () => {
  const {
    notifications: dbNotifications,
    loading,
    unreadCount,
    markAsRead: dbMarkAsRead,
    archive: dbArchive,
    clearAll: dbClearAll,
    markAllAsRead,
    createNotification: dbCreateNotification
  } = useRealTimeNotifications()

  // Convert database notifications to UI format
  const notifications = dbNotifications.map(convertToUINotification)

  const markAsRead = dbMarkAsRead
  const archive = dbArchive
  const clearAll = dbClearAll

  const addNotification = async (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    await dbCreateNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category,
      metadata: { actions: notification.actions || [] }
    })
  }


  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    archive,
    clearAll,
    markAllAsRead,
    addNotification
  }
}