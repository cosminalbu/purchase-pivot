import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  MoreHorizontal
} from "lucide-react";
import { useDashboardStatsQuery } from "@/hooks/useDashboardStatsQuery";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";
import { useEnhancedToast } from "@/hooks/useEnhancedToast";
import { ActivityFeed } from "@/components/ui/activity-feed";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading, error } = useDashboardStatsQuery();
  const { purchaseOrders, loading: posLoading } = usePurchaseOrders();
  const toast = useEnhancedToast();

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
        <Button className="gap-2">
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
              <Button variant="ghost" size="sm" className="text-primary">
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
                <Button className="mt-2">Create your first purchase order</Button>
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
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
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
              <Button className="w-full justify-start gap-2" variant="outline">
                <FileText className="h-4 w-4" />
                Create Purchase Order
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <Users className="h-4 w-4" />
                Add New Supplier
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <TrendingUp className="h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;