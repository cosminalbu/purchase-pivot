import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrder, PurchaseOrderLineItem } from '@/lib/supabase-types';
import { useToast } from '@/hooks/use-toast';
import { useActivityLog } from './useActivityLog';

export const usePurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logActivity } = useActivityLog();

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchaseOrders(data || []);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      toast({
        title: "Error",
        description: "Failed to load purchase orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPurchaseOrder = async (po: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'po_number'>) => {
    try {
      // Get the next PO number
      const { data: poNumber, error: fnError } = await supabase
        .rpc('generate_po_number');

      if (fnError) throw fnError;

      const { data, error } = await supabase
        .from('purchase_orders')
        .insert([{ ...po, po_number: poNumber }])
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .single();

      if (error) throw error;
      
      setPurchaseOrders(prev => [data, ...prev]);
      
      // Log activity
      await logActivity(
        'purchase_order',
        data.id,
        'created',
        `Created purchase order ${data.po_number} for ${data.supplier?.company_name || 'Unknown Supplier'}`,
        undefined,
        data
      );
      
      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePurchaseOrder = async (id: string, updates: Partial<PurchaseOrder>) => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .single();

      if (error) throw error;
      
      const oldPO = purchaseOrders.find(po => po.id === id);
      setPurchaseOrders(prev => prev.map(po => po.id === id ? data : po));
      
      // Log activity
      await logActivity(
        'purchase_order',
        id,
        'updated',
        `Updated purchase order ${data.po_number}`,
        oldPO,
        data
      );
      
      toast({
        title: "Success",
        description: "Purchase order updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to update purchase order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePurchaseOrder = async (id: string) => {
    try {
      // First check if the PO is in draft status
      const po = purchaseOrders.find(p => p.id === id);
      if (!po) {
        throw new Error('Purchase order not found');
      }
      
      if (po.status !== 'draft') {
        throw new Error('Only draft purchase orders can be deleted. Use void instead for non-draft orders.');
      }

      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPurchaseOrders(prev => prev.filter(po => po.id !== id));
      
      // Log activity
      await logActivity(
        'purchase_order',
        id,
        'deleted',
        `Deleted purchase order ${po.po_number}`,
        po
      );
      
      toast({
        title: "Success",
        description: "Purchase order deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete purchase order",
        variant: "destructive",
      });
      throw error;
    }
  };

  const voidPurchaseOrder = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .update({ status: 'voided' })
        .eq('id', id)
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .single();

      if (error) throw error;
      
      const oldPO = purchaseOrders.find(po => po.id === id);
      setPurchaseOrders(prev => prev.map(po => po.id === id ? data : po));
      
      // Log activity
      await logActivity(
        'purchase_order',
        id,
        'voided',
        `Voided purchase order ${data.po_number}`,
        oldPO,
        data
      );
      
      toast({
        title: "Success",
        description: "Purchase order voided successfully",
      });
      return data;
    } catch (error) {
      console.error('Error voiding purchase order:', error);
      toast({
        title: "Error",
        description: "Failed to void purchase order",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  return {
    purchaseOrders,
    loading,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    voidPurchaseOrder,
    refetch: fetchPurchaseOrders
  };
};