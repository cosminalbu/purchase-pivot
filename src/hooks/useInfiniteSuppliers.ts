import { useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { queryKeys } from '@/lib/react-query'

const SUPPLIERS_PER_PAGE = 20

interface UseInfiniteSuppliersParms {
  searchQuery?: string
  filters?: string[]
}

export const useInfiniteSuppliers = ({ 
  searchQuery = '', 
  filters = [] 
}: UseInfiniteSuppliersParms = {}) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.suppliers.all, searchQuery, ...filters],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('suppliers')
        .select(`
          id,
          company_name,
          contact_person,
          email,
          phone,
          address,
          city,
          state,
          postal_code,
          country,
          tax_id,
          payment_terms,
          credit_limit,
          status,
          notes,
          created_at,
          updated_at
        `)
        .order('company_name')
        .range(pageParam * SUPPLIERS_PER_PAGE, (pageParam + 1) * SUPPLIERS_PER_PAGE - 1)

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(`company_name.ilike.%${searchQuery}%,contact_person.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      }

      // Apply status filters
      if (filters.length > 0) {
        query = query.in('status', filters)
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      return {
        suppliers: data || [],
        nextCursor: data && data.length === SUPPLIERS_PER_PAGE ? pageParam + 1 : null,
        hasMore: data && data.length === SUPPLIERS_PER_PAGE,
        total: count || 0,
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  })
}

export const useSupplierCounts = () => {
  return useInfiniteQuery({
    queryKey: ['suppliers', 'counts'],
    queryFn: async () => {
      const [
        { count: totalCount },
        { count: activeCount },
        { count: inactiveCount },
      ] = await Promise.all([
        supabase.from('suppliers').select('*', { count: 'exact', head: true }),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'inactive'),
      ])

      return {
        total: totalCount || 0,
        active: activeCount || 0,
        inactive: inactiveCount || 0,
      }
    },
    getNextPageParam: () => null,
    initialPageParam: 0,
  })
}