import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import StatusBadge, { POStatus } from "@/components/StatusBadge";
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
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders";

const Dashboard = () => {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { purchaseOrders, loading: posLoading } = usePurchaseOrders();

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
          value={statsLoading ? "..." : stats.totalPOs}
          change="+12% from last month"
          trend="up"
          icon={<FileText className="h-4 w-4" />}
        />
        <DashboardCard
          title="Pending Approval"
          value={statsLoading ? "..." : stats.pendingApproval}
          change="3 urgent"
          trend="neutral"
          icon={<Clock className="h-4 w-4" />}
        />
        <DashboardCard
          title="Total Value (YTD)"
          value={statsLoading ? "..." : formatCurrency(stats.totalValue)}
          change="+8% from last year"
          trend="up"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <DashboardCard
          title="Active Suppliers"
          value={statsLoading ? "..." : stats.activeSuppliers}
          change="+2 this month"
          trend="up"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Purchase Orders */}
        <Card className="lg:col-span-2">
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
              <div className="text-center py-4">Loading recent purchase orders...</div>
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

        {/* Quick Actions & Summary */}
        <div className="space-y-6">
          {/* Quick Actions */}
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

          {/* Approval Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Queue</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : stats.pendingApproval === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No pending approvals</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {purchaseOrders
                    .filter(po => po.status === 'pending')
                    .slice(0, 2)
                    .map((po) => (
                      <div key={po.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div>
                          <p className="font-medium text-sm">{po.po_number}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(po.total_amount)}</p>
                        </div>
                        <StatusBadge status={po.status as POStatus} />
                      </div>
                    ))}
                  <Button variant="outline" className="w-full text-sm">
                    Review All ({stats.pendingApproval})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;