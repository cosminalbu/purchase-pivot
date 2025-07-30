import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 404s or auth errors
        if (error?.status === 404 || error?.status === 401 || error?.status === 403) {
          return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Query keys factory for consistent key management
export const queryKeys = {
  // Dashboard
  dashboardStats: ['dashboard', 'stats'] as const,
  
  // Suppliers
  suppliers: {
    all: ['suppliers'] as const,
    active: ['suppliers', 'active'] as const,
    detail: (id: string) => ['suppliers', 'detail', id] as const,
    contacts: (supplierId: string) => ['suppliers', 'contacts', supplierId] as const,
  },
  
  // Purchase Orders
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    detail: (id: string) => ['purchase-orders', 'detail', id] as const,
    lineItems: (poId: string) => ['purchase-orders', 'line-items', poId] as const,
    infinite: (filters?: Record<string, any>) => ['purchase-orders', 'infinite', filters] as const,
  },
  
  // User management
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
} as const

// Helper to invalidate related queries
export const invalidateQueries = {
  suppliers: () => queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all }),
  purchaseOrders: () => queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all }),
  dashboardStats: () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats }),
  all: () => queryClient.invalidateQueries(),
}