import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Users, Contact } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { AddSupplierForm } from "@/components/forms/AddSupplierForm";
import { ViewSupplierDialog } from "@/components/suppliers/ViewSupplierDialog";
import { EditSupplierDialog } from "@/components/suppliers/EditSupplierDialog";
import { DeleteSupplierDialog } from "@/components/suppliers/DeleteSupplierDialog";
import { ManageContactsDialog } from "@/components/suppliers/ManageContactsDialog";
import { Supplier } from "@/lib/supabase-types";

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
};

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactsDialogOpen, setContactsDialogOpen] = useState(false);
  const { suppliers, loading } = useSuppliers();

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier relationships</p>
        </div>
        <AddSupplierForm />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Suppliers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{loading ? "..." : suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Suppliers
            </CardTitle>
            <Contact className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {loading ? "..." : suppliers.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>ABN</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading suppliers...
                  </TableCell>
                </TableRow>
              ) : filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{supplier.company_name}</div>
                      {supplier.email && (
                        <div className="text-sm text-muted-foreground">{supplier.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{supplier.abn || "—"}</TableCell>
                  <TableCell>
                    <div>
                      {supplier.phone && (
                        <div className="text-sm">{supplier.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {[supplier.city, supplier.state].filter(Boolean).join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      supplier.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedSupplier(supplier);
                          setViewDialogOpen(true);
                        }}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedSupplier(supplier);
                          setEditDialogOpen(true);
                        }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedSupplier(supplier);
                          setContactsDialogOpen(true);
                        }}>Manage Contacts</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredSuppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm ? "No suppliers found matching your search" : "No suppliers found"}
                      </p>
                      {!searchTerm && <AddSupplierForm />}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ViewSupplierDialog
        supplier={selectedSupplier}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <EditSupplierDialog
        supplier={selectedSupplier}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <DeleteSupplierDialog
        supplier={selectedSupplier}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />

      <ManageContactsDialog
        supplier={selectedSupplier}
        open={contactsDialogOpen}
        onOpenChange={setContactsDialogOpen}
      />
    </div>
  );
};

export default Suppliers;