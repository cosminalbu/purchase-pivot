import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DashboardCard from "@/components/DashboardCard";
import StatusBadge, { POStatus } from "@/components/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  Users, 
  DollarSign, 
  Clock,
  TrendingUp,
  Eye,
  Edit,
  MoreHorizontal,
  Trash2,
  Ban
} from "lucide-react";
import { useDashboardStatsQuery } from "@/hooks/useDashboardStatsQuery";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useEnhancedToast } from "@/hooks/useEnhancedToast";
import { useSuppliers } from "@/hooks/useSuppliers";
import { ActivityFeed } from "@/components/ui/activity-feed";
import { CreatePurchaseOrderDialog } from "@/components/purchase-orders/CreatePurchaseOrderDialog";
import { ViewPurchaseOrderDialog } from "@/components/purchase-orders/ViewPurchaseOrderDialog";
import { EditPurchaseOrderDialog } from "@/components/purchase-orders/EditPurchaseOrderDialog";
import { DeletePurchaseOrderDialog } from "@/components/purchase-orders/DeletePurchaseOrderDialog";
import { VoidPurchaseOrderDialog } from "@/components/purchase-orders/VoidPurchaseOrderDialog";
import { AddSupplierForm } from "@/components/forms/AddSupplierForm";

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading, error } = useDashboardStatsQuery();
  const { purchaseOrders, loading: posLoading, refetch, deletePurchaseOrder, voidPurchaseOrder } = usePurchaseOrders();
  const { addSupplier } = useSuppliers();
  const toast = useEnhancedToast();

  // Dialog states
  const [createPOOpen, setCreatePOOpen] = useState(false);
  const [viewPOOpen, setViewPOOpen] = useState(false);
  const [editPOOpen, setEditPOOpen] = useState(false);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  // Show error toast if query fails
  if (error) {
    toast.error({
      title: "Error loading dashboard",
      description: "Failed to load dashboard statistics",
      action: {
        label: "Retry",
        onClick: () => window.location.reload()
      }
    });
  }

  // Get recent POs (last 4)
  const recentPOs = purchaseOrders.slice(0, 4);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  // Button handlers
  const handleCreatePO = () => {
    setCreatePOOpen(true);
  };

  const handleViewAll = () => {
    navigate('/purchase-orders');
  };

  const handleViewPO = (po: any) => {
    setSelectedPO(po);
    setViewPOOpen(true);
  };

  const handleEditPO = (po: any) => {
    setSelectedPO(po);
    setEditPOOpen(true);
  };

  const handleDeletePO = async (po: any) => {
    try {
      await deletePurchaseOrder(po.id);
      refetch();
      toast.success({
        title: "Success",
        description: "Purchase order deleted successfully"
      });
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to delete purchase order"
      });
    }
  };

  const handleVoidPO = async (po: any) => {
    try {
      await voidPurchaseOrder(po.id);
      refetch();
      toast.success({
        title: "Success", 
        description: "Purchase order voided successfully"
      });
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to void purchase order"
      });
    }
  };

  const handleAddSupplier = () => {
    setAddSupplierOpen(true);
  };

  const handleSupplierAdded = () => {
    setAddSupplierOpen(false);
    toast.success({
      title: "Success",
      description: "Supplier added successfully"
    });
  };

  const handleViewReports = () => {
    toast.info({
      title: "Coming Soon",
      description: "Reports feature is under development"
    });
  };

  const handleDialogSuccess = () => {
    refetch();
    toast.success({
      title: "Success",
      description: "Action completed successfully"
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your purchase orders.
          </p>
        </div>
        <Button className="gap-2" onClick={handleCreatePO}>
          <FileText className="h-4 w-4" />
          Create Purchase Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Purchase Orders"
          value={statsLoading ? "..." : stats?.totalPOs.toString() || "0"}
          change="+12% from last month"
          trend="up"
          icon={<FileText className="h-4 w-4" />}
          loading={statsLoading}
        />
        <DashboardCard
          title="Pending Approval"
          value={statsLoading ? "..." : stats?.pendingApproval.toString() || "0"}
          change="3 urgent"
          trend="neutral"
          icon={<Clock className="h-4 w-4" />}
          loading={statsLoading}
        />
        <DashboardCard
          title="Total Value (YTD)"
          value={statsLoading ? "..." : formatCurrency(stats?.totalValue || 0)}
          change="+8% from last year"
          trend="up"
          icon={<DollarSign className="h-4 w-4" />}
          loading={statsLoading}
        />
        <DashboardCard
          title="Active Suppliers"
          value={statsLoading ? "..." : stats?.activeSuppliers.toString() || "0"}
          change="+2 this month"
          trend="up"
          icon={<Users className="h-4 w-4" />}
          loading={statsLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recent Purchase Orders */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Purchase Orders
              <Button variant="ghost" size="sm" className="text-primary" onClick={handleViewAll}>
                View all
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {posLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <div className="text-right space-y-2">
                      <Skeleton className="h-5 w-16" />
                      <div className="flex space-x-1">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-6 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPOs.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No purchase orders yet</p>
                <Button className="mt-2" onClick={handleCreatePO}>Create your first purchase order</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPOs.map((po) => (
                  <div
                    key={po.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-foreground">{po.po_number}</span>
                        <StatusBadge status={po.status as POStatus} />
                      </div>
                      <p className="text-sm text-muted-foreground">{po.supplier?.company_name || "—"}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Created: {new Date(po.created_at).toLocaleDateString()}</span>
                        {po.delivery_date && (
                          <span>Required: {new Date(po.delivery_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-foreground">{formatCurrency(po.total_amount)}</p>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleViewPO(po)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditPO(po)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {po.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handleDeletePO(po)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                            {!['cancelled', 'draft'].includes(po.status) && (
                              <DropdownMenuItem onClick={() => handleVoidPO(po)}>
                                <Ban className="mr-2 h-4 w-4" />
                                Void
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <div className="lg:col-span-4">
          <ActivityFeed limit={10} />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-2" variant="outline" onClick={handleCreatePO}>
                <FileText className="h-4 w-4" />
                Create Purchase Order
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={handleAddSupplier}>
                <Users className="h-4 w-4" />
                Add New Supplier
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={handleViewReports}>
                <TrendingUp className="h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CreatePurchaseOrderDialog
        open={createPOOpen}
        onOpenChange={setCreatePOOpen}
      />

      {selectedPO && (
        <>
          <ViewPurchaseOrderDialog
            open={viewPOOpen}
            onOpenChange={setViewPOOpen}
            purchaseOrder={selectedPO}
          />
          
          <EditPurchaseOrderDialog
            open={editPOOpen}
            onOpenChange={setEditPOOpen}
            purchaseOrder={selectedPO}
          />
        </>
      )}

      <Dialog open={addSupplierOpen} onOpenChange={setAddSupplierOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <AddSupplierForm />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;