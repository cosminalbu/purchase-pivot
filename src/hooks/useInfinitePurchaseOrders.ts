import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { queryKeys } from '@/lib/react-query'

const POS_PER_PAGE = 20

interface UseInfinitePurchaseOrdersParams {
  searchQuery?: string
  statusFilter?: string
  supplierFilter?: string
}

export const useInfinitePurchaseOrders = ({ 
  searchQuery = '', 
  statusFilter = '',
  supplierFilter = ''
}: UseInfinitePurchaseOrdersParams = {}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.purchaseOrders.infinite({ searchQuery, statusFilter, supplierFilter }),
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('purchase_orders')
        .select(`
          id,
          po_number,
          supplier_id,
          total_amount,
          status,
          order_date,
          delivery_date,
          notes,
          created_at,
          updated_at,
          suppliers!inner(
            id,
            company_name
          )
        `)
        .order('created_at', { ascending: false })
        .range(pageParam * POS_PER_PAGE, (pageParam + 1) * POS_PER_PAGE - 1)

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`po_number.ilike.%${searchQuery}%,notes.ilike.%${searchQuery}%,suppliers.company_name.ilike.%${searchQuery}%`)
      }

      // Apply status filter
      if (statusFilter) {
        query = query.eq('status', statusFilter)
      }

      // Apply supplier filter
      if (supplierFilter) {
        query = query.eq('supplier_id', supplierFilter)
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        purchaseOrders: data || [],
        nextCursor: data && data.length === POS_PER_PAGE ? pageParam + 1 : null,
        hasMore: data && data.length === POS_PER_PAGE,
        total: count || 0,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  })
}

export const usePurchaseOrderCounts = () => {
  return useInfiniteQuery({
    queryKey: ['purchase-orders', 'counts'],
    queryFn: async () => {
      const [
        { count: totalCount },
        { count: draftCount },
        { count: pendingCount },
        { count: approvedCount },
        { count: receivedCount },
        { count: voidedCount },
      ] = await Promise.all([
        supabase.from('purchase_orders').select('*', { count: 'exact', head: true }),
        supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('status', 'received'),
        supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('status', 'voided'),
      ])

      return {
        total: totalCount || 0,
        draft: draftCount || 0,
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        received: receivedCount || 0,
        voided: voidedCount || 0,
      }
    },
    getNextPageParam: () => null,
    initialPageParam: 0,
  })
}