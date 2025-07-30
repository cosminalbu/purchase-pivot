import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";

export interface LineItem {
  id?: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes?: string;
}

interface PurchaseOrderLineItemsProps {
  lineItems: LineItem[];
  onLineItemsChange: (lineItems: LineItem[]) => void;
  disabled?: boolean;
}

export const PurchaseOrderLineItems = ({ 
  lineItems, 
  onLineItemsChange, 
  disabled = false 
}: PurchaseOrderLineItemsProps) => {
  const [newItem, setNewItem] = useState<Omit<LineItem, 'id' | 'line_total'>>({
    item_description: "",
    quantity: 1,
    unit_price: 0,
    notes: ""
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const addLineItem = () => {
    if (!newItem.item_description.trim()) return;

    const lineItem: LineItem = {
      ...newItem,
      line_total: calculateLineTotal(newItem.quantity, newItem.unit_price),
      id: `temp-${Date.now()}`
    };

    onLineItemsChange([...lineItems, lineItem]);
    setNewItem({
      item_description: "",
      quantity: 1,
      unit_price: 0,
      notes: ""
    });
  };

  const removeLineItem = (index: number) => {
    const updated = lineItems.filter((_, i) => i !== index);
    onLineItemsChange(updated);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      updated[index].line_total = calculateLineTotal(
        updated[index].quantity, 
        updated[index].unit_price
      );
    }
    
    onLineItemsChange(updated);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
  const taxAmount = subtotal * 0.1; // 10% GST
  const totalAmount = subtotal + taxAmount;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Line Items</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLineItem}
          disabled={disabled || !newItem.item_description.trim()}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Add New Item Form */}
      <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 rounded-lg">
        <div className="col-span-5">
          <Input
            placeholder="Item description"
            value={newItem.item_description}
            onChange={(e) => setNewItem({ ...newItem, item_description: e.target.value })}
            disabled={disabled}
          />
        </div>
        <div className="col-span-2">
          <Input
            type="number"
            placeholder="Qty"
            min="1"
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
            disabled={disabled}
          />
        </div>
        <div className="col-span-2">
          <Input
            type="number"
            placeholder="Unit Price"
            min="0"
            step="0.01"
            value={newItem.unit_price}
            onChange={(e) => setNewItem({ ...newItem, unit_price: parseFloat(e.target.value) || 0 })}
            disabled={disabled}
          />
        </div>
        <div className="col-span-2">
          <div className="flex items-center h-9 px-3 text-sm text-muted-foreground">
            {formatCurrency(calculateLineTotal(newItem.quantity, newItem.unit_price))}
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>

      {/* Line Items Table */}
      {lineItems.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[15%]">Quantity</TableHead>
              <TableHead className="w-[15%]">Unit Price</TableHead>
              <TableHead className="w-[15%]">Line Total</TableHead>
              <TableHead className="w-[15%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item, index) => (
              <TableRow key={item.id || index}>
                <TableCell>
                  <Input
                    value={item.item_description}
                    onChange={(e) => updateLineItem(index, 'item_description', e.target.value)}
                    disabled={disabled}
                    className="border-0 p-0 h-auto"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    disabled={disabled}
                    className="border-0 p-0 h-auto"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    disabled={disabled}
                    className="border-0 p-0 h-auto"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(item.line_total)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                    disabled={disabled}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>GST (10%):</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between font-medium text-base border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};