import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Plus,
  User,
  LogOut
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PendingApproval from "@/pages/PendingApproval";

interface LayoutProps {
  children: ReactNode;
  notificationCenter?: ReactNode;
}

const Layout = ({ children, notificationCenter }: LayoutProps) => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { toast } = useToast();

  // Show pending approval page for pending users
  if (profile?.role === 'pending') {
    return <PendingApproval />;
  }

  const getNavigation = () => {
    const baseNavigation = [
      { name: "Dashboard", href: "/", icon: BarChart3 },
      { name: "Purchase Orders", href: "/purchase-orders", icon: FileText },
      { name: "Suppliers", href: "/suppliers", icon: Users },
    ];

    // Add admin-only navigation
    if (profile?.role === 'admin') {
      baseNavigation.push({ name: "User Management", href: "/users", icon: Settings });
    }

    return baseNavigation;
  };

  const navigation = getNavigation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src={logo} alt="PO Manager" className="h-8 w-8" />
              <h1 className="text-xl font-semibold text-foreground">PO Manager</h1>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search purchase orders, suppliers..."
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New PO
              </Button>
              {notificationCenter || (
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                  <Badge className="ml-1 bg-status-pending text-white">3</Badge>
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {profile?.first_name || 'User'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.first_name} {profile?.last_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.role?.charAt(0).toUpperCase()}{profile?.role?.slice(1)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;