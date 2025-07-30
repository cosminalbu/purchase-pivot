import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}

const DashboardCard = ({ title, value, change, icon, trend, loading = false }: DashboardCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {loading ? <Skeleton className="h-4 w-24" /> : title}
        </CardTitle>
        <div className="text-muted-foreground">
          {loading ? <Skeleton className="h-4 w-4 rounded" /> : icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {loading ? <Skeleton className="h-8 w-16" /> : value}
        </div>
        {loading ? (
          <Skeleton className="h-3 w-20 mt-1" />
        ) : change ? (
          <p className={`text-xs ${
            trend === "up" 
              ? "text-status-approved" 
              : trend === "down" 
              ? "text-destructive" 
              : "text-muted-foreground"
          }`}>
            {change}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;