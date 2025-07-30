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
import { Trash2, Plus, Save, X } from "lucide-react";
import { usePurchaseOrderLineItems } from "@/hooks/usePurchaseOrderLineItems";
import { PurchaseOrderLineItem } from "@/lib/supabase-types";

interface EditPurchaseOrderLineItemsProps {
  purchaseOrderId: string;
  disabled?: boolean;
  onTotalsChange?: () => void;
}

interface EditingLineItem extends Partial<PurchaseOrderLineItem> {
  tempId?: string;
  isEditing?: boolean;
  isNew?: boolean;
}

export const EditPurchaseOrderLineItems = ({ 
  purchaseOrderId, 
  disabled = false,
  onTotalsChange
}: EditPurchaseOrderLineItemsProps) => {
  const { lineItems, addLineItem, updateLineItem, deleteLineItem, totals } = usePurchaseOrderLineItems(purchaseOrderId);
  const [editingItems, setEditingItems] = useState<{ [key: string]: EditingLineItem }>({});
  const [newItem, setNewItem] = useState<EditingLineItem>({
    item_description: "",
    quantity: 1,
    unit_price: 0,
    notes: "",
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

  const startEditing = (item: PurchaseOrderLineItem) => {
    setEditingItems(prev => ({
      ...prev,
      [item.id]: { ...item, isEditing: true }
    }));
  };

  const cancelEditing = (itemId: string) => {
    setEditingItems(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const saveLineItem = async (itemId: string) => {
    const editingItem = editingItems[itemId];
    if (!editingItem || !editingItem.item_description?.trim()) return;

    try {
      await updateLineItem(itemId, {
        item_description: editingItem.item_description,
        quantity: editingItem.quantity || 1,
        unit_price: editingItem.unit_price || 0,
        line_total: calculateLineTotal(editingItem.quantity || 1, editingItem.unit_price || 0),
        notes: editingItem.notes || null,
      });
      
      cancelEditing(itemId);
      onTotalsChange?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const addNewLineItem = async () => {
    if (!newItem.item_description?.trim()) return;

    try {
      await addLineItem({
        purchase_order_id: purchaseOrderId,
        item_description: newItem.item_description,
        quantity: newItem.quantity || 1,
        unit_price: newItem.unit_price || 0,
        line_total: calculateLineTotal(newItem.quantity || 1, newItem.unit_price || 0),
        notes: newItem.notes || null,
      });

      setNewItem({
        item_description: "",
        quantity: 1,
        unit_price: 0,
        notes: "",
      });
      onTotalsChange?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const removeLineItem = async (itemId: string) => {
    try {
      await deleteLineItem(itemId);
      onTotalsChange?.();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const updateEditingItem = (itemId: string, field: keyof EditingLineItem, value: any) => {
    setEditingItems(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
        line_total: field === 'quantity' || field === 'unit_price' 
          ? calculateLineTotal(
              field === 'quantity' ? value : prev[itemId]?.quantity || 1,
              field === 'unit_price' ? value : prev[itemId]?.unit_price || 0
            )
          : prev[itemId]?.line_total
      }
    }));
  };

  const updateNewItem = (field: keyof EditingLineItem, value: any) => {
    setNewItem(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Line Items</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addNewLineItem}
          disabled={disabled || !newItem.item_description?.trim()}
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
            value={newItem.item_description || ""}
            onChange={(e) => updateNewItem('item_description', e.target.value)}
            disabled={disabled}
          />
        </div>
        <div className="col-span-2">
          <Input
            type="number"
            placeholder="Qty"
            min="1"
            value={newItem.quantity || 1}
            onChange={(e) => updateNewItem('quantity', parseInt(e.target.value) || 1)}
            disabled={disabled}
          />
        </div>
        <div className="col-span-2">
          <Input
            type="number"
            placeholder="Unit Price"
            min="0"
            step="0.01"
            value={newItem.unit_price || 0}
            onChange={(e) => updateNewItem('unit_price', parseFloat(e.target.value) || 0)}
            disabled={disabled}
          />
        </div>
        <div className="col-span-2">
          <div className="flex items-center h-9 px-3 text-sm text-muted-foreground">
            {formatCurrency(calculateLineTotal(newItem.quantity || 1, newItem.unit_price || 0))}
          </div>
        </div>
        <div className="col-span-1"></div>
      </div>

      {/* Line Items Table */}
      {lineItems.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Description</TableHead>
              <TableHead className="w-[12%]">Quantity</TableHead>
              <TableHead className="w-[12%]">Unit Price</TableHead>
              <TableHead className="w-[12%]">Line Total</TableHead>
              <TableHead className="w-[12%]">Notes</TableHead>
              <TableHead className="w-[17%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => {
              const isEditing = editingItems[item.id]?.isEditing;
              const editingItem = editingItems[item.id] || item;

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editingItem.item_description || ""}
                        onChange={(e) => updateEditingItem(item.id, 'item_description', e.target.value)}
                        disabled={disabled}
                        className="border-0 p-0 h-auto"
                      />
                    ) : (
                      <span>{item.item_description}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        value={editingItem.quantity || 1}
                        onChange={(e) => updateEditingItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        disabled={disabled}
                        className="border-0 p-0 h-auto"
                      />
                    ) : (
                      <span>{item.quantity}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editingItem.unit_price || 0}
                        onChange={(e) => updateEditingItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        disabled={disabled}
                        className="border-0 p-0 h-auto"
                      />
                    ) : (
                      <span>{formatCurrency(item.unit_price)}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(isEditing ? (editingItem.line_total || 0) : item.line_total)}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        value={editingItem.notes || ""}
                        onChange={(e) => updateEditingItem(item.id, 'notes', e.target.value)}
                        disabled={disabled}
                        className="border-0 p-0 h-auto"
                        placeholder="Notes..."
                      />
                    ) : (
                      <span className="text-muted-foreground">{item.notes || "—"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {isEditing ? (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => saveLineItem(item.id)}
                            disabled={disabled}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelEditing(item.id)}
                            disabled={disabled}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(item)}
                          disabled={disabled}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(item.id)}
                        disabled={disabled || isEditing}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>GST (10%):</span>
            <span>{formatCurrency(totals.taxAmount)}</span>
          </div>
          <div className="flex justify-between font-medium text-base border-t pt-2">
            <span>Total:</span>
            <span>{formatCurrency(totals.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};