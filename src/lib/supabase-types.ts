export interface Supplier {
  id: string;
  company_name: string;
  abn: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: 'active' | 'inactive';
  is_gst_registered: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierContact {
  id: string;
  supplier_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: string;
  status: 'draft' | 'pending' | 'approved' | 'delivered' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  order_date: string | null;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
  suppliers?: Supplier;
}

export interface PurchaseOrderLineItem {
  id: string;
  purchase_order_id: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes: string | null;
  is_heading: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'employee' | 'viewer' | 'pending';
  department: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}