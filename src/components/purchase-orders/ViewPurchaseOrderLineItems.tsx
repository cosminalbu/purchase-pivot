import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePurchaseOrderLineItems } from "@/hooks/usePurchaseOrderLineItems";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ViewPurchaseOrderLineItemsProps {
  purchaseOrderId: string;
}

export function ViewPurchaseOrderLineItems({ purchaseOrderId }: ViewPurchaseOrderLineItemsProps) {
  const { lineItems, loading } = usePurchaseOrderLineItems(purchaseOrderId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lineItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No line items found for this purchase order.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Item Description</TableHead>
              <TableHead className="w-[15%] text-right">Quantity</TableHead>
              <TableHead className="w-[20%] text-right">Unit Price</TableHead>
              <TableHead className="w-[25%] text-right">Line Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item.id} className={item.is_heading ? 'bg-muted/30' : ''}>
                <TableCell>
                  <div>
                    <p className={`${item.is_heading ? 'font-bold text-foreground' : 'font-medium'}`}>
                      {item.item_description}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className={`text-right ${item.is_heading ? 'text-muted-foreground' : ''}`}>
                  {item.is_heading ? '-' : item.quantity}
                </TableCell>
                <TableCell className={`text-right ${item.is_heading ? 'text-muted-foreground' : ''}`}>
                  {item.is_heading ? '-' : formatCurrency(item.unit_price)}
                </TableCell>
                <TableCell className={`text-right font-medium ${item.is_heading ? 'text-muted-foreground' : ''}`}>
                  {item.is_heading ? '-' : formatCurrency(item.line_total)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}