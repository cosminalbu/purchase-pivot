import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Supplier } from "@/lib/supabase-types";
import { Calendar, MapPin, Phone, Mail, Globe } from "lucide-react";

interface ViewSupplierDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ViewSupplierDialog = ({ supplier, open, onOpenChange }: ViewSupplierDialogProps) => {
  if (!supplier) return null;

  const fullAddress = [
    supplier.address_line_1,
    supplier.address_line_2,
    supplier.city,
    supplier.state,
    supplier.postal_code
  ].filter(Boolean).join(", ");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {supplier.company_name}
            <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
              {supplier.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid gap-2">
              {supplier.abn && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">ABN:</span>
                  <span>{supplier.abn}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Created:</span>
                <span>{new Date(supplier.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="grid gap-2">
              {supplier.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{supplier.phone}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{supplier.email}</span>
                </div>
              )}
              {supplier.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <a 
                    href={supplier.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {supplier.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          {fullAddress && (
            <div className="grid gap-4">
              <h3 className="text-lg font-semibold">Address</h3>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1" />
                <span>{fullAddress}</span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};