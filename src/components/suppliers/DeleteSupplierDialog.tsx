import { useState } from "react";
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
import { Supplier } from "@/lib/supabase-types";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useToast } from "@/hooks/use-toast";

interface DeleteSupplierDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteSupplierDialog = ({ supplier, open, onOpenChange }: DeleteSupplierDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { deleteSupplier } = useSuppliers();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!supplier) return;
    
    setIsLoading(true);
    try {
      await deleteSupplier(supplier.id);
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier. This supplier may have associated purchase orders.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!supplier) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{supplier.company_name}</strong>? 
            This action cannot be undone and will remove all supplier information.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Supplier"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};