import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Ban } from "lucide-react";

interface VoidPurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  poNumber: string;
}

export const VoidPurchaseOrderDialog = ({
  open,
  onOpenChange,
  onConfirm,
  poNumber,
}: VoidPurchaseOrderDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-amber-500" />
            Void Purchase Order
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to void purchase order{" "}
            <span className="font-semibold">{poNumber}</span>?
            <br />
            <br />
            <span className="text-amber-600 font-medium">
              Voiding will mark this purchase order as cancelled and inactive.
            </span>{" "}
            The purchase order will remain in the system for audit purposes but will no longer be active.
            <br />
            <br />
            <span className="text-muted-foreground text-sm">
              This is the recommended action for purchase orders that have already entered the business process (non-draft status).
              Unlike deletion, voiding maintains the audit trail and historical data.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            Void Purchase Order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};