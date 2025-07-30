import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import StatusBadge, { POStatus } from "@/components/StatusBadge";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { MobileCard, MobileCardField } from "@/components/ui/mobile-card";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2,
  Ban,
  MoreHorizontal,
  FileText
} from "lucide-react";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { CreatePurchaseOrderDialog } from "@/components/purchase-orders/CreatePurchaseOrderDialog";
import { ViewPurchaseOrderDialog } from "@/components/purchase-orders/ViewPurchaseOrderDialog";
import { EditPurchaseOrderDialog } from "@/components/purchase-orders/EditPurchaseOrderDialog";
import { DeletePurchaseOrderDialog } from "@/components/purchase-orders/DeletePurchaseOrderDialog";
import { VoidPurchaseOrderDialog } from "@/components/purchase-orders/VoidPurchaseOrderDialog";
import { PurchaseOrder } from "@/lib/supabase-types";
import { useToast } from "@/hooks/use-toast";

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<POStatus | "all">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const { purchaseOrders, loading, deletePurchaseOrder, voidPurchaseOrder } = usePurchaseOrders();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Enhanced filtering with active filters
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (po.supplier?.company_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;

    // Apply active filters
    const matchesActiveFilters = activeFilters.every(filter => {
      switch (filter.key) {
        case 'status':
          return po.status === filter.value;
        case 'supplier':
          return po.supplier?.company_name === filter.value;
        default:
          return true;
      }
    });

    return matchesSearch && matchesStatus && matchesActiveFilters;
  });

  // Filter options for enhanced search
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'sent', label: 'Sent' },
        { value: 'received', label: 'Received' },
        { value: 'completed', label: 'Completed' },
        { value: 'voided', label: 'Voided' }
      ]
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const handleDeletePO = async () => {
    if (!selectedPO) return;
    try {
      await deletePurchaseOrder(selectedPO.id);
      setDeleteDialogOpen(false);
      setSelectedPO(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleVoidPO = async () => {
    if (!selectedPO) return;
    try {
      await voidPurchaseOrder(selectedPO.id);
      setVoidDialogOpen(false);
      setSelectedPO(null);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteOrVoidAction = (po: PurchaseOrder) => {
    setSelectedPO(po);
    if (po.status === 'draft') {
      setDeleteDialogOpen(true);
    } else {
      setVoidDialogOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your purchase orders
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      {/* Enhanced Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <EnhancedSearch
            placeholder="Search by PO number, supplier, or description..."
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filterOptions}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />

          {/* Legacy Filter Controls for Status (keeping for now) */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Status: {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Statuses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("draft")}>
                    Draft
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
                    Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("delivered")}>
                    Delivered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                    Cancelled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("voided")}>
                    Voided
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => {
                  const csvContent = filteredPOs.map(po => ({
                    'PO Number': po.po_number,
                    'Supplier': po.supplier?.company_name || '',
                    'Status': po.status,
                    'Amount': po.total_amount,
                    'Order Date': po.order_date || '',
                    'Delivery Date': po.delivery_date || '',
                    'Created': po.created_at
                  }));
                  
                  const headers = Object.keys(csvContent[0] || {});
                  const csvString = [
                    headers.join(','),
                    ...csvContent.map(row => headers.map(header => 
                      `"${(row as any)[header]}"`
                    ).join(','))
                  ].join('\n');
                  
                  const blob = new Blob([csvString], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `purchase-orders-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                  
                  toast({
                    title: "Export Complete",
                    description: `Exported ${filteredPOs.length} purchase orders to CSV`,
                  });
                }}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Purchase Orders
            <Badge variant="secondary">
              {loading ? "..." : `${filteredPOs.length} of ${purchaseOrders.length}`}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            // Mobile Card View
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-20"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </div>
                      <div className="h-5 bg-muted rounded-full w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-24"></div>
                      <div className="h-3 bg-muted rounded w-28"></div>
                    </div>
                  </div>
                ))
              ) : filteredPOs.map((po) => (
                <MobileCard key={po.id}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-foreground">{po.po_number}</h3>
                        <p className="text-sm text-muted-foreground">{po.supplier?.company_name || "—"}</p>
                      </div>
                      <StatusBadge status={po.status as POStatus} />
                    </div>
                    
                    <div className="space-y-2">
                      <MobileCardField 
                        label="Amount" 
                        value={<span className="font-semibold">{formatCurrency(po.total_amount)}</span>} 
                      />
                      <MobileCardField 
                        label="Order Date" 
                        value={po.order_date ? new Date(po.order_date).toLocaleDateString() : "—"} 
                      />
                      <MobileCardField 
                        label="Delivery Date" 
                        value={po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : "—"} 
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedPO(po);
                          setViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedPO(po);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            className="gap-2"
                            onClick={() => {
                              toast({
                                title: "Coming Soon",
                                description: "PDF generation feature will be available soon",
                              });
                            }}
                          >
                            <FileText className="h-4 w-4" />
                            Generate PDF (Soon)
                          </DropdownMenuItem>
                          {po.status === 'draft' ? (
                            <DropdownMenuItem 
                              className="gap-2 text-destructive"
                              onClick={() => handleDeleteOrVoidAction(po)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              className="gap-2 text-amber-600"
                              onClick={() => handleDeleteOrVoidAction(po)}
                            >
                              <Ban className="h-4 w-4" />
                              Void
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </MobileCard>
              ))}
            </div>
          ) : (
            // Desktop Table View
            <>
              {loading ? (
                <SkeletonTable rows={5} columns={7} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Delivery Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPOs.map((po) => (
                      <TableRow key={po.id} className="hover:bg-accent">
                        <TableCell className="font-medium">{po.po_number}</TableCell>
                        <TableCell>{po.supplier?.company_name || "—"}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(po.total_amount)}</TableCell>
                        <TableCell>
                          <StatusBadge status={po.status as POStatus} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {po.order_date ? new Date(po.order_date).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {po.delivery_date ? new Date(po.delivery_date).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => {
                                  setSelectedPO(po);
                                  setViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => {
                                  setSelectedPO(po);
                                  setEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => {
                                  toast({
                                    title: "Coming Soon",
                                    description: "PDF generation feature will be available soon",
                                  });
                                }}
                              >
                                <FileText className="h-4 w-4" />
                                Generate PDF (Soon)
                              </DropdownMenuItem>
                              {po.status === 'draft' ? (
                                <DropdownMenuItem 
                                  className="gap-2 text-destructive"
                                  onClick={() => handleDeleteOrVoidAction(po)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="gap-2 text-amber-600"
                                  onClick={() => handleDeleteOrVoidAction(po)}
                                >
                                  <Ban className="h-4 w-4" />
                                  Void
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}

          {!loading && filteredPOs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No purchase orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Create your first purchase order to get started"
                }
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>Create your first purchase order</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CreatePurchaseOrderDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
      
      <ViewPurchaseOrderDialog 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen} 
        purchaseOrder={selectedPO}
      />
      
      <EditPurchaseOrderDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        purchaseOrder={selectedPO}
      />

      <DeletePurchaseOrderDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen} 
        onConfirm={handleDeletePO}
        poNumber={selectedPO?.po_number || ""}
      />

      <VoidPurchaseOrderDialog 
        open={voidDialogOpen} 
        onOpenChange={setVoidDialogOpen} 
        onConfirm={handleVoidPO}
        poNumber={selectedPO?.po_number || ""}
      />
    </div>
  );
};

export default PurchaseOrders;