import { useState } from "react";
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
import { PurchaseOrderLineItems, LineItem } from "./PurchaseOrderLineItems";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const purchaseOrderSchema = z.object({
  supplier_id: z.string().min(1, "Supplier is required"),
  order_date: z.date().optional(),
  delivery_date: z.date().optional(),
  notes: z.string().optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePurchaseOrderDialog = ({ open, onOpenChange }: CreatePurchaseOrderDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const { suppliers } = useSuppliers();
  const { addPurchaseOrder } = usePurchaseOrders();
  const { toast } = useToast();

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier_id: "",
      notes: "",
    },
  });

  const onSubmit = async (data: PurchaseOrderFormData) => {
    if (lineItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one line item",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
      const tax_amount = subtotal * 0.1; // 10% GST
      const total_amount = subtotal + tax_amount;

      // Create the purchase order
      const purchaseOrderData = {
        supplier_id: data.supplier_id,
        status: 'draft' as const,
        subtotal,
        tax_amount,
        total_amount,
        currency: 'AUD',
        order_date: data.order_date ? format(data.order_date, 'yyyy-MM-dd') : null,
        delivery_date: data.delivery_date ? format(data.delivery_date, 'yyyy-MM-dd') : null,
        notes: data.notes || null,
      };

      const purchaseOrder = await addPurchaseOrder(purchaseOrderData);

      // Save line items to the database
      if (purchaseOrder?.id) {
        const lineItemsData = lineItems.map(item => ({
          purchase_order_id: purchaseOrder.id,
          item_description: item.item_description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          notes: item.notes || null
        }));

        const { error: lineItemsError } = await supabase
          .from('purchase_order_line_items')
          .insert(lineItemsData);

        if (lineItemsError) {
          throw new Error('Failed to save line items');
        }
      }

      toast({
        title: "Success",
        description: `Purchase order ${purchaseOrder.po_number} created successfully`,
      });

      // Reset form and close dialog
      form.reset();
      setLineItems([]);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <div className="space-y-4">
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
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <PurchaseOrderLineItems
              lineItems={lineItems}
              onLineItemsChange={setLineItems}
              disabled={isLoading}
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
                {isLoading ? "Creating..." : "Create Purchase Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};