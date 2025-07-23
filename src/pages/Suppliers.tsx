import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { 
  Plus, 
  Search, 
  Phone,
  Mail,
  Globe,
  MapPin,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  Building
} from "lucide-react";

// Mock data
const mockSuppliers = [
  {
    id: "SUP-001",
    companyName: "TechCorp Solutions",
    abn: "12 345 678 901",
    address: "123 Tech Street, Sydney NSW 2000",
    phone: "+61 2 9876 5432",
    fax: "+61 2 9876 5433", 
    email: "orders@techcorp.com.au",
    website: "www.techcorp.com.au",
    contactCount: 3,
    recentPOs: 5,
    totalValue: 45200.00,
    status: "active"
  },
  {
    id: "SUP-002",
    companyName: "Office Supplies Co",
    abn: "98 765 432 109",
    address: "456 Office Ave, Melbourne VIC 3000",
    phone: "+61 3 8765 4321",
    fax: "+61 3 8765 4322",
    email: "sales@officesupplies.com.au", 
    website: "www.officesupplies.com.au",
    contactCount: 2,
    recentPOs: 12,
    totalValue: 15650.75,
    status: "active"
  },
  {
    id: "SUP-003",
    companyName: "Industrial Parts Ltd",
    abn: "55 123 987 654",
    address: "789 Industrial Rd, Perth WA 6000",
    phone: "+61 8 6543 2109",
    fax: "+61 8 6543 2110",
    email: "procurement@industrialparts.com.au",
    website: "www.industrialparts.com.au",
    contactCount: 4,
    recentPOs: 8,
    totalValue: 89340.50,
    status: "active"
  },
  {
    id: "SUP-004",
    companyName: "Software Licensing Inc",
    abn: "44 987 321 654",
    address: "321 Software Plaza, Brisbane QLD 4000",
    phone: "+61 7 3456 7890",
    fax: "",
    email: "licensing@softwareinc.com.au",
    website: "www.softwareinc.com.au",
    contactCount: 1,
    recentPOs: 3,
    totalValue: 25800.00,
    status: "active"
  },
];

const Suppliers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSuppliers = mockSuppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.abn.includes(searchTerm) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your supplier database and contacts
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search suppliers by name, ABN, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{mockSuppliers.length}</p>
                <p className="text-xs text-muted-foreground">Total Suppliers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {mockSuppliers.reduce((acc, sup) => acc + sup.contactCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Supplier Directory
            <Badge variant="secondary">
              {filteredSuppliers.length} suppliers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>ABN</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Recent POs</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="hover:bg-accent/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{supplier.companyName}</p>
                      {supplier.website && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Globe className="h-3 w-3" />
                          <span>{supplier.website}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{supplier.abn}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-primary hover:underline cursor-pointer">
                          {supplier.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-1 text-xs text-muted-foreground max-w-48">
                      <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{supplier.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {supplier.contactCount} contacts
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {supplier.recentPOs} POs
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(supplier.totalValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Supplier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Users className="h-4 w-4" />
                          Manage Contacts
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8">
              <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No suppliers found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria
              </p>
              <Button>Add your first supplier</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Suppliers;