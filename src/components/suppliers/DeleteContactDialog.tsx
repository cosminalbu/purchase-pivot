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
import { SupplierContact } from "@/lib/supabase-types";
import { useSupplierContacts } from "@/hooks/useSupplierContacts";
import { useToast } from "@/hooks/use-toast";

interface DeleteContactDialogProps {
  contact: SupplierContact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteContactDialog = ({ contact, open, onOpenChange }: DeleteContactDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { deleteContact } = useSupplierContacts(contact?.supplier_id || null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!contact) return;
    
    setIsLoading(true);
    try {
      await deleteContact(contact.id);
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!contact) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Contact</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{contact.first_name} {contact.last_name}</strong>? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Contact"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};