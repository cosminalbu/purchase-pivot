import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type POStatus = "draft" | "pending" | "approved" | "delivered" | "cancelled";

interface StatusBadgeProps {
  status: POStatus;
  className?: string;
}

const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-gray-500 text-white",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-500 text-white",
  },
  approved: {
    label: "Approved",
    className: "bg-blue-500 text-white",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-500 text-white",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-500 text-white",
  },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;