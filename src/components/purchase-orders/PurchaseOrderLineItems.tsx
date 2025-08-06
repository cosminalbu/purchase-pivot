import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

export interface LineItem {
  id?: string;
  item_description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes?: string;
  is_heading?: boolean;
}

interface PurchaseOrderLineItemsProps {
  lineItems: LineItem[];
  onLineItemsChange: (lineItems: LineItem[]) => void;
  disabled?: boolean;
  supplierGstRegistered?: boolean;
}

export const PurchaseOrderLineItems = ({ 
  lineItems, 
  onLineItemsChange, 
  disabled = false,
  supplierGstRegistered = true
}: PurchaseOrderLineItemsProps) => {
  const [newItem, setNewItem] = useState<Omit<LineItem, 'id' | 'line_total'>>({
    item_description: "",
    quantity: 1,
    unit_price: 0,
    notes: "",
    is_heading: false
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
      notes: "",
      is_heading: false
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

  const subtotal = lineItems.filter(item => !item.is_heading).reduce((sum, item) => sum + item.line_total, 0);
  const taxAmount = supplierGstRegistered ? subtotal * 0.1 : 0; // 10% GST only if supplier is GST registered
  const totalAmount = subtotal + taxAmount;

  return (
    <div className="space-y-4">
      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
        <div className="col-span-5">Description</div>
        <div className="col-span-2">Quantity</div>
        <div className="col-span-2">Unit Price</div>
        <div className="col-span-2">Line Total</div>
        <div className="col-span-1">Actions</div>
      </div>

      {/* Add New Item Form */}
      <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="is-heading"
            checked={newItem.is_heading}
            onCheckedChange={(checked) => {
              setNewItem({ 
                ...newItem, 
                is_heading: !!checked,
                quantity: checked ? 0 : 1,
                unit_price: checked ? 0 : newItem.unit_price
              });
            }}
            disabled={disabled}
          />
          <Label htmlFor="is-heading" className="text-sm">This is a heading</Label>
        </div>
        <div className="grid grid-cols-12 gap-2">
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
              min="0"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
              disabled={disabled || newItem.is_heading}
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
              disabled={disabled || newItem.is_heading}
            />
          </div>
          <div className="col-span-2">
            <div className="flex items-center h-9 px-3 text-sm text-muted-foreground">
              {formatCurrency(calculateLineTotal(newItem.quantity, newItem.unit_price))}
            </div>
          </div>
          <div className="col-span-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLineItem}
              disabled={disabled || !newItem.item_description.trim()}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Line Items */}
      {lineItems.length > 0 && (
        <div className="space-y-2">
          {lineItems.map((item, index) => (
            <div key={item.id || index} className={`grid grid-cols-12 gap-2 p-2 border rounded-lg ${item.is_heading ? 'bg-muted/30' : ''}`}>
              <div className="col-span-5">
                <Input
                  value={item.item_description}
                  onChange={(e) => updateLineItem(index, 'item_description', e.target.value)}
                  disabled={disabled}
                  className={`border-0 p-0 h-auto ${item.is_heading ? 'font-semibold text-foreground' : ''}`}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  disabled={disabled || item.is_heading}
                  className={`border-0 p-0 h-auto ${item.is_heading ? 'text-muted-foreground' : ''}`}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  disabled={disabled || item.is_heading}
                  className={`border-0 p-0 h-auto ${item.is_heading ? 'text-muted-foreground' : ''}`}
                />
              </div>
              <div className={`col-span-2 flex items-center text-sm font-medium ${item.is_heading ? 'text-muted-foreground' : ''}`}>
                {item.is_heading ? '-' : formatCurrency(item.line_total)}
              </div>
              <div className="col-span-1">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{supplierGstRegistered ? 'GST (10%):' : 'No GST:'}</span>
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