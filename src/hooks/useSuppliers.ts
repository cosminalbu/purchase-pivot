import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Supplier, SupplierContact } from '@/lib/supabase-types';
import { useToast } from '@/hooks/use-toast';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('company_name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select()
        .single();

      if (error) throw error;
      
      setSuppliers(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Supplier added successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSuppliers(prev => prev.map(s => s.id === id ? data : s));
      toast({
        title: "Success",
        description: "Supplier updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: "Error",
        description: "Failed to update supplier",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSuppliers(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('suppliers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'suppliers'
        },
        (payload) => {
          console.log('Suppliers real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setSuppliers(prev => [...prev, payload.new as Supplier]);
          } else if (payload.eventType === 'UPDATE') {
            setSuppliers(prev => prev.map(supplier => 
              supplier.id === payload.new.id ? payload.new as Supplier : supplier
            ));
          } else if (payload.eventType === 'DELETE') {
            setSuppliers(prev => prev.filter(supplier => supplier.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    suppliers,
    loading,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers
  };
};