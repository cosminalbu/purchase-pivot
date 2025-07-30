import { useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/react-query'

export const useRealTimeData = () => {
  const queryClient = useQueryClient()

  // Invalidate queries when data changes
  const invalidateQueries = useCallback((tableName: string, eventType: string) => {
    switch (tableName) {
      case 'purchase_orders':
        queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
        break
      case 'suppliers':
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats })
        break
      case 'supplier_contacts':
        queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all })
        break
      case 'purchase_order_line_items':
        queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all })
        break
    }
  }, [queryClient])

  useEffect(() => {
    // Set up real-time subscriptions for all main tables
    const channel = supabase
      .channel('all-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_orders'
        },
        (payload) => {
          console.log('Purchase order change:', payload)
          invalidateQueries('purchase_orders', payload.eventType)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suppliers'
        },
        (payload) => {
          console.log('Supplier change:', payload)
          invalidateQueries('suppliers', payload.eventType)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_contacts'
        },
        (payload) => {
          console.log('Supplier contact change:', payload)
          invalidateQueries('supplier_contacts', payload.eventType)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_order_line_items'
        },
        (payload) => {
          console.log('Line item change:', payload)
          invalidateQueries('purchase_order_line_items', payload.eventType)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [invalidateQueries])

  return {
    // This hook sets up real-time subscriptions but doesn't return data
    // It automatically invalidates React Query caches when data changes
  }
}