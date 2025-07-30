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
import { Trash2 } from "lucide-react";

interface DeletePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  poNumber: string;
}

export const DeletePurchaseOrderDialog = ({
  open,
  onOpenChange,
  onConfirm,
  poNumber,
}: DeletePurchaseOrderDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Delete Purchase Order
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to permanently delete purchase order{" "}
            <span className="font-semibold">{poNumber}</span>?
            <br />
            <br />
            <span className="text-destructive font-medium">
              This action cannot be undone.
            </span>{" "}
            The purchase order and all its line items will be permanently removed from the system.
            <br />
            <br />
            <span className="text-muted-foreground text-sm">
              Note: This option is only available for draft purchase orders that haven't entered the business process.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};