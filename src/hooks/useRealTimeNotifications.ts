import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export interface DatabaseNotification {
  id: string
  user_id?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'system' | 'purchase-order' | 'supplier' | 'approval' | 'user'
  read: boolean
  archived: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Fetch notifications from database
  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('archived', false)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }, [])

  // Archive notification
  const archive = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ archived: true })
        .eq('id', id)

      if (error) throw error

      setNotifications(prev => 
        prev.filter(notification => notification.id !== id)
      )
    } catch (error) {
      console.error('Error archiving notification:', error)
    }
  }, [])

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ archived: true })
        .eq('user_id', user.id)
        .eq('archived', false)

      if (error) throw error

      setNotifications([])
    } catch (error) {
      console.error('Error clearing notifications:', error)
    }
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      )
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }, [])

  // Create new notification
  const createNotification = useCallback(async (
    notification: Omit<DatabaseNotification, 'id' | 'user_id' | 'read' | 'archived' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_title: notification.title,
        p_message: notification.message,
        p_type: notification.type,
        p_category: notification.category,
        p_metadata: notification.metadata || {}
      })

      if (error) throw error
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  // Set up real-time subscription
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Initial fetch
      fetchNotifications()

      // Set up real-time subscription
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as DatabaseNotification
            setNotifications(prev => [newNotification, ...prev])
            
            // Show toast for new notifications
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: newNotification.type === 'error' ? 'destructive' : 'default'
            })
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const updatedNotification = payload.new as DatabaseNotification
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === updatedNotification.id 
                  ? updatedNotification 
                  : notification
              )
            )
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    getUser()
  }, [fetchNotifications, toast])

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    archive,
    clearAll,
    markAllAsRead,
    createNotification,
    refetch: fetchNotifications
  }
}