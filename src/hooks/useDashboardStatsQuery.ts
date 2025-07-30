import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { queryKeys } from '@/lib/react-query'

interface DashboardStats {
  totalPOs: number;
  pendingApproval: number;
  totalValue: number;
  activeSuppliers: number;
}

export const useDashboardStatsQuery = () => {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async (): Promise<DashboardStats> => {
      // Get total POs
      const { count: totalPOs } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true });

      // Get pending POs
      const { count: pendingApproval } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get total value
      const { data: valueData } = await supabase
        .from('purchase_orders')
        .select('total_amount');

      const totalValue = valueData?.reduce((sum, po) => sum + Number(po.total_amount), 0) || 0;

      // Get active suppliers
      const { count: activeSuppliers } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        totalPOs: totalPOs || 0,
        pendingApproval: pendingApproval || 0,
        totalValue,
        activeSuppliers: activeSuppliers || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};