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
      
      // Real-time subscription will handle state update
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
      
      // Real-time subscription will handle state update
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
      
      // Real-time subscription will handle state update
    } catch (error) {
      console.error('Error deleting supplier contact:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [supplierId]);

  useEffect(() => {
    if (!supplierId) return;

    const channel = supabase
      .channel('supplier-contacts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_contacts',
          filter: `supplier_id=eq.${supplierId}`
        },
        (payload) => {
          console.log('Supplier contacts real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setContacts(prev => {
              const newContact = payload.new as SupplierContact;
              // Avoid duplicates and maintain proper ordering
              if (!prev.find(c => c.id === newContact.id)) {
                return [...prev, newContact].sort((a, b) => {
                  if (a.is_primary !== b.is_primary) return b.is_primary ? 1 : -1;
                  return a.first_name.localeCompare(b.first_name);
                });
              }
              return prev;
            });
          } else if (payload.eventType === 'UPDATE') {
            setContacts(prev => prev.map(contact => 
              contact.id === payload.new.id ? payload.new as SupplierContact : contact
            ).sort((a, b) => {
              if (a.is_primary !== b.is_primary) return b.is_primary ? 1 : -1;
              return a.first_name.localeCompare(b.first_name);
            }));
          } else if (payload.eventType === 'DELETE') {
            setContacts(prev => prev.filter(contact => contact.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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