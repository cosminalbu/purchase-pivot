import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'

export interface ActivityLog {
  id: string
  user_id?: string
  entity_type: 'purchase_order' | 'supplier' | 'user' | 'system'
  entity_id?: string
  action: 'created' | 'updated' | 'deleted' | 'approved' | 'voided' | 'sent'
  description: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  created_at: string
}

export const useActivityLog = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch recent activities
  const fetchActivities = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      setActivities(data || [])
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Log new activity
  const logActivity = useCallback(async (
    entityType: ActivityLog['entity_type'],
    entityId: string | undefined,
    action: ActivityLog['action'],
    description: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.rpc('log_activity', {
        p_user_id: user.id,
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_action: action,
        p_description: description,
        p_old_values: oldValues || null,
        p_new_values: newValues || null
      })

      if (error) throw error
    } catch (error) {
      console.error('Error logging activity:', error)
    }
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    fetchActivities()

    const channel = supabase
      .channel('activity-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs'
        },
        (payload) => {
          const newActivity = payload.new as ActivityLog
          setActivities(prev => [newActivity, ...prev.slice(0, 99)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchActivities])

  return {
    activities,
    loading,
    logActivity,
    refetch: fetchActivities
  }
}