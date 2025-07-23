import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type POStatus = "draft" | "pending" | "approved" | "sent" | "received" | "completed";

interface StatusBadgeProps {
  status: POStatus;
  className?: string;
}

const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-status-draft text-white",
  },
  pending: {
    label: "Pending Approval",
    className: "bg-status-pending text-white",
  },
  approved: {
    label: "Approved",
    className: "bg-status-approved text-white",
  },
  sent: {
    label: "Sent",
    className: "bg-status-sent text-white",
  },
  received: {
    label: "Received",
    className: "bg-status-received text-white",
  },
  completed: {
    label: "Completed",
    className: "bg-status-completed text-white",
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