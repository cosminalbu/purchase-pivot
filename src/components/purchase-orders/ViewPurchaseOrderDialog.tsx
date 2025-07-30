import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PurchaseOrder } from "@/lib/supabase-types";
import { ViewPurchaseOrderLineItems } from "./ViewPurchaseOrderLineItems";
import { format } from "date-fns";

interface ViewPurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder | null;
}

export function ViewPurchaseOrderDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: ViewPurchaseOrderDialogProps) {
  if (!purchaseOrder) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-secondary text-secondary-foreground';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'delivered':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Purchase Order Details</span>
            <Badge className={getStatusColor(purchaseOrder.status)}>
              {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* PO Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Purchase Order</h3>
              <p className="font-mono text-lg">{purchaseOrder.po_number}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Supplier</h3>
              <p className="text-lg">{purchaseOrder.supplier?.company_name || 'Unknown Supplier'}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Order Date</h3>
              <p>{formatDate(purchaseOrder.order_date)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Delivery Date</h3>
              <p>{formatDate(purchaseOrder.delivery_date)}</p>
            </div>
          </div>

          {/* Notes */}
          {purchaseOrder.notes && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">Notes</h3>
              <p className="text-sm bg-muted p-3 rounded-md">{purchaseOrder.notes}</p>
            </div>
          )}

          <Separator />

          {/* Line Items */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Line Items</h3>
            <ViewPurchaseOrderLineItems purchaseOrderId={purchaseOrder.id} />
          </div>

          {/* Totals */}
          <div className="bg-muted p-4 rounded-md">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(purchaseOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (GST):</span>
                <span>{formatCurrency(purchaseOrder.tax_amount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(purchaseOrder.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}