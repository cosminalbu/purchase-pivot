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

// Mock data - will be replaced with real data later
const mockStats = {
  totalPOs: 127,
  pendingApproval: 8,
  totalValue: "$847,230",
  activeSuppliers: 45,
};

const mockRecentPOs = [
  {
    id: "PO-2024-001",
    supplier: "TechCorp Solutions",
    value: "$12,450",
    status: "pending" as POStatus,
    date: "2024-01-15",
    requiredBy: "2024-01-25"
  },
  {
    id: "PO-2024-002", 
    supplier: "Office Supplies Co",
    value: "$890",
    status: "approved" as POStatus,
    date: "2024-01-14",
    requiredBy: "2024-01-20"
  },
  {
    id: "PO-2024-003",
    supplier: "Industrial Parts Ltd",
    value: "$25,600",
    status: "sent" as POStatus,
    date: "2024-01-13",
    requiredBy: "2024-01-30"
  },
  {
    id: "PO-2024-004",
    supplier: "Software Licensing Inc",
    value: "$8,200",
    status: "received" as POStatus,
    date: "2024-01-12",
    requiredBy: "2024-01-18"
  },
];

const Dashboard = () => {
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
          value={mockStats.totalPOs}
          change="+12% from last month"
          trend="up"
          icon={<FileText className="h-4 w-4" />}
        />
        <DashboardCard
          title="Pending Approval"
          value={mockStats.pendingApproval}
          change="3 urgent"
          trend="neutral"
          icon={<Clock className="h-4 w-4" />}
        />
        <DashboardCard
          title="Total Value (YTD)"
          value={mockStats.totalValue}
          change="+8% from last year"
          trend="up"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <DashboardCard
          title="Active Suppliers"
          value={mockStats.activeSuppliers}
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
            <div className="space-y-4">
              {mockRecentPOs.map((po) => (
                <div
                  key={po.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-foreground">{po.id}</span>
                      <StatusBadge status={po.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{po.supplier}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Created: {po.date}</span>
                      <span>Required: {po.requiredBy}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold text-foreground">{po.value}</p>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium text-sm">PO-2024-001</p>
                    <p className="text-xs text-muted-foreground">$12,450</p>
                  </div>
                  <StatusBadge status="pending" />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium text-sm">PO-2024-005</p>
                    <p className="text-xs text-muted-foreground">$3,200</p>
                  </div>
                  <StatusBadge status="pending" />
                </div>
                <Button variant="outline" className="w-full text-sm">
                  Review All ({mockStats.pendingApproval})
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;