import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseOrderLineItem } from '@/lib/supabase-types';
import { useToast } from '@/hooks/use-toast';

export const usePurchaseOrderLineItems = (purchaseOrderId?: string, applyGst: boolean = true) => {
  const [lineItems, setLineItems] = useState<PurchaseOrderLineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLineItems = async () => {
    if (!purchaseOrderId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_order_line_items')
        .select('*')
        .eq('purchase_order_id', purchaseOrderId)
        .order('created_at');

      if (error) throw error;
      setLineItems(data || []);
    } catch (error) {
      console.error('Error fetching line items:', error);
      toast({
        title: "Error",
        description: "Failed to load line items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addLineItem = async (lineItem: Omit<PurchaseOrderLineItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('purchase_order_line_items')
        .insert([lineItem])
        .select()
        .single();

      if (error) throw error;
      
      setLineItems(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Line item added successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding line item:', error);
      toast({
        title: "Error",
        description: "Failed to add line item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateLineItem = async (id: string, updates: Partial<PurchaseOrderLineItem>) => {
    try {
      const { data, error } = await supabase
        .from('purchase_order_line_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setLineItems(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "Success",
        description: "Line item updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating line item:', error);
      toast({
        title: "Error",
        description: "Failed to update line item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteLineItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('purchase_order_line_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setLineItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Success",
        description: "Line item deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting line item:', error);
      toast({
        title: "Error",
        description: "Failed to delete line item",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Calculate totals (exclude headings from calculations)
  const subtotal = lineItems.filter(item => !item.is_heading).reduce((sum, item) => sum + item.line_total, 0);
  const taxAmount = applyGst ? subtotal * 0.1 : 0; // 10% GST only if supplier is GST registered
  const totalAmount = subtotal + taxAmount;

  useEffect(() => {
    fetchLineItems();
  }, [purchaseOrderId]);

  return {
    lineItems,
    loading,
    addLineItem,
    updateLineItem,
    deleteLineItem,
    refetch: fetchLineItems,
    totals: {
      subtotal,
      taxAmount,
      totalAmount
    }
  };
};