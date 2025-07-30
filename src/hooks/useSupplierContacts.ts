import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SupplierContact } from "@/lib/supabase-types";

export const useSupplierContacts = (supplierId: string | null) => {
  const [contacts, setContacts] = useState<SupplierContact[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    if (!supplierId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('supplier_contacts')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('is_primary', { ascending: false })
        .order('first_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching supplier contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData: Omit<SupplierContact, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('supplier_contacts')
        .insert([contactData])
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding supplier contact:', error);
      throw error;
    }
  };

  const updateContact = async (contactId: string, contactData: Partial<SupplierContact>) => {
    try {
      const { data, error } = await supabase
        .from('supplier_contacts')
        .update(contactData)
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? data : contact
      ));
      return data;
    } catch (error) {
      console.error('Error updating supplier contact:', error);
      throw error;
    }
  };

  const deleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('supplier_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
    } catch (error) {
      console.error('Error deleting supplier contact:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [supplierId]);

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refetch: fetchContacts,
  };
};