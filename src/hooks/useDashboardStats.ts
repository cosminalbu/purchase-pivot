import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalPOs: number;
  pendingApproval: number;
  totalValue: number;
  activeSuppliers: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPOs: 0,
    pendingApproval: 0,
    totalValue: 0,
    activeSuppliers: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      
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

      setStats({
        totalPOs: totalPOs || 0,
        pendingApproval: pendingApproval || 0,
        totalValue,
        activeSuppliers: activeSuppliers || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};