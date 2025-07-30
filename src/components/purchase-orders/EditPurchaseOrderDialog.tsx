import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSuppliers } from "@/hooks/useSuppliers";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { usePurchaseOrderLineItems } from "@/hooks/usePurchaseOrderLineItems";
import { EditPurchaseOrderLineItems } from "./EditPurchaseOrderLineItems";
import { useToast } from "@/hooks/use-toast";
import { PurchaseOrder } from "@/lib/supabase-types";

const editPurchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, "Supplier is required"),
  status: z.enum(['draft', 'pending', 'approved', 'delivered', 'cancelled']),
  order_date: z.date().optional(),
  delivery_date: z.date().optional(),
  notes: z.string().optional(),
});

type EditPurchaseOrderFormData = z.infer<typeof editPurchaseOrderSchema>;

interface EditPurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  purchaseOrder: PurchaseOrder | null;
}

export const EditPurchaseOrderDialog = ({ 
  open, 
  onOpenChange, 
  purchaseOrder 
}: EditPurchaseOrderDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { suppliers } = useSuppliers();
  const { updatePurchaseOrder } = usePurchaseOrders();
  const { lineItems, totals, refetch } = usePurchaseOrderLineItems(purchaseOrder?.id);
  const { toast } = useToast();

  const form = useForm<EditPurchaseOrderFormData>({
    resolver: zodResolver(editPurchaseOrderSchema),
    defaultValues: {
      supplier_id: "",
      status: "draft",
      notes: "",
    },
  });

  // Reset form when purchaseOrder changes
  useEffect(() => {
    if (purchaseOrder) {
      form.reset({
        supplier_id: purchaseOrder.supplier_id,
        status: purchaseOrder.status,
        order_date: purchaseOrder.order_date ? new Date(purchaseOrder.order_date) : undefined,
        delivery_date: purchaseOrder.delivery_date ? new Date(purchaseOrder.delivery_date) : undefined,
        notes: purchaseOrder.notes || "",
      });
    }
  }, [purchaseOrder, form]);

  const onSubmit = async (data: EditPurchaseOrderFormData) => {
    if (!purchaseOrder) return;

    setIsLoading(true);
    try {
      // Calculate totals from line items
      const { subtotal, taxAmount, totalAmount } = totals;

      // Update the purchase order
      const updatedPO = await updatePurchaseOrder(purchaseOrder.id, {
        supplier_id: data.supplier_id,
        status: data.status,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        order_date: data.order_date ? format(data.order_date, 'yyyy-MM-dd') : null,
        delivery_date: data.delivery_date ? format(data.delivery_date, 'yyyy-MM-dd') : null,
        notes: data.notes || null,
      });

      toast({
        title: "Success",
        description: `Purchase order ${updatedPO.po_number} updated successfully`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update purchase order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Status options based on current status
  const getStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft':
        return ['draft', 'pending'];
      case 'pending':
        return ['pending', 'approved', 'cancelled'];
      case 'approved':
        return ['approved', 'delivered'];
      case 'delivered':
      case 'cancelled':
        return [currentStatus]; // No changes allowed
      default:
        return ['draft', 'pending', 'approved', 'delivered', 'cancelled'];
    }
  };

  const statusOptions = purchaseOrder ? getStatusOptions(purchaseOrder.status) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit Purchase Order {purchaseOrder?.po_number}
          </DialogTitle>
        </DialogHeader>
        
        {purchaseOrder && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.company_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="order_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Order Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="delivery_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Delivery Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes or requirements..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <EditPurchaseOrderLineItems
                purchaseOrderId={purchaseOrder.id}
                disabled={isLoading}
                onTotalsChange={refetch}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Purchase Order"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};