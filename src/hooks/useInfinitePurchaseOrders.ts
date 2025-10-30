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
      // Use the database function for efficient cross-table search
      const { data, error } = await supabase.rpc('search_purchase_orders', {
        search_text: searchQuery.trim() || null,
        status_filter: statusFilter || null,
        supplier_filter: supplierFilter || null,
        page_offset: pageParam * POS_PER_PAGE,
        page_limit: POS_PER_PAGE
      })

      if (error) {
        console.error('Purchase Orders search error:', error)
        throw error
      }

      // Transform the flat result from the function to match the expected structure
      const purchaseOrders = (data || []).map((row: any) => ({
        id: row.id,
        po_number: row.po_number,
        supplier_id: row.supplier_id,
        subtotal: row.subtotal,
        tax_amount: row.tax_amount,
        total_amount: row.total_amount,
        status: row.status,
        order_date: row.order_date,
        delivery_date: row.delivery_date,
        notes: row.notes,
        created_at: row.created_at,
        updated_at: row.updated_at,
        suppliers: {
          id: row.supplier_id,
          company_name: row.supplier_company_name
        }
      }))

      return {
        purchaseOrders,
        nextCursor: data && data.length === POS_PER_PAGE ? pageParam + 1 : null,
        hasMore: data && data.length === POS_PER_PAGE,
        total: data?.length || 0,
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