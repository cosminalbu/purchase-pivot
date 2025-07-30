import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal, Users, Contact } from "lucide-react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { AddSupplierForm } from "@/components/forms/AddSupplierForm";
import { ViewSupplierDialog } from "@/components/suppliers/ViewSupplierDialog";
import { EditSupplierDialog } from "@/components/suppliers/EditSupplierDialog";
import { DeleteSupplierDialog } from "@/components/suppliers/DeleteSupplierDialog";
import { ManageContactsDialog } from "@/components/suppliers/ManageContactsDialog";
import { Supplier } from "@/lib/supabase-types";
import { EnhancedSearch } from "@/components/ui/enhanced-search";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { MobileCard } from "@/components/ui/mobile-card";
import { useIsMobile } from "@/hooks/use-mobile";

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
};

const Suppliers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contactsDialogOpen, setContactsDialogOpen] = useState(false);
  const { suppliers, loading } = useSuppliers();
  const isMobile = useIsMobile();

  // Filter suppliers based on search and filters
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = 
      supplier.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.abn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.state?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilters = selectedFilters.length === 0 || selectedFilters.some(filter => {
      switch (filter) {
        case 'active':
          return supplier.status === 'active';
        case 'inactive':
          return supplier.status === 'inactive';
        case 'gst-registered':
          return supplier.is_gst_registered;
        case 'no-gst':
          return !supplier.is_gst_registered;
        default:
          return true;
      }
    });

    return matchesSearch && matchesFilters;
  });

  const filterOptions = [
    { label: 'Active', value: 'active', count: suppliers.filter(s => s.status === 'active').length },
    { label: 'Inactive', value: 'inactive', count: suppliers.filter(s => s.status === 'inactive').length },
    { label: 'GST Registered', value: 'gst-registered', count: suppliers.filter(s => s.is_gst_registered).length },
    { label: 'No GST', value: 'no-gst', count: suppliers.filter(s => !s.is_gst_registered).length },
  ];

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Suppliers</h1>
              <p className="text-muted-foreground">Manage your supplier relationships</p>
            </div>
            <AddSupplierForm />
          </div>
          <SkeletonTable />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
            <div className="text-2xl font-bold text-foreground">{suppliers.length}</div>
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
              {suppliers.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <EnhancedSearch
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search suppliers by name, ABN, email, phone, or location..."
        filters={[
          { key: 'status', label: 'Status', type: 'select', options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]},
          { key: 'gst', label: 'GST Registration', type: 'select', options: [
            { value: 'registered', label: 'GST Registered' },
            { value: 'not-registered', label: 'No GST' }
          ]}
        ]}
      />

      {/* Suppliers Table/Cards */}
      {!isMobile ? (
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
                {filteredSuppliers.map((supplier) => (
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
              {filteredSuppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No suppliers found matching your search" : "No suppliers found"}
                      </p>
                      {!searchQuery && <AddSupplierForm />}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      ) : (
        <div className="space-y-4">
          {filteredSuppliers.map((supplier) => (
            <MobileCard key={supplier.id}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{supplier.company_name}</h3>
                    {supplier.abn && (
                      <p className="text-sm text-muted-foreground">ABN: {supplier.abn}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      supplier.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                    </span>
                    {supplier.is_gst_registered && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        GST
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  {supplier.email && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="text-foreground">{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="text-foreground">{supplier.phone}</span>
                    </div>
                  )}
                  {[supplier.city, supplier.state].filter(Boolean).length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-foreground">{[supplier.city, supplier.state].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setViewDialogOpen(true);
                    }}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSupplier(supplier);
                      setContactsDialogOpen(true);
                    }}
                  >
                    Contacts
                  </Button>
                </div>
              </div>
            </MobileCard>
          ))}
          {filteredSuppliers.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8">
              <Users className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                {searchQuery ? "No suppliers found matching your search" : "No suppliers found"}
              </p>
              {!searchQuery && <AddSupplierForm />}
            </div>
          )}
        </div>
      )}

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
    </ErrorBoundary>
  );
};

export default Suppliers;