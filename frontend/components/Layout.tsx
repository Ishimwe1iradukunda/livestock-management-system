import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu,
  Home,
  PawPrint,
  Heart,
  TrendingUp,
  DollarSign,
  Package,
  X,
  Plus,
  BarChart3,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AlertsSidebar from "./AlertsSidebar";
import AdvancedDataEntry from "./AdvancedDataEntry";
import NotificationCenter from "./NotificationCenter";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Animals", href: "/animals", icon: PawPrint },
  { name: "Feeds", href: "/feeds", icon: Package },
  { name: "Health", href: "/health", icon: Heart },
  { name: "Production", href: "/production", icon: TrendingUp },
  { name: "Financial", href: "/financial", icon: DollarSign },
  { name: "Monitoring", href: "/monitoring", icon: Activity },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDataEntry, setShowDataEntry] = useState(false);

  const isActivePath = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const NavContent = () => (
    <nav className="space-y-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = isActivePath(item.href);
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
      
      <div className="pt-4 border-t border-border">
        <Button 
          onClick={() => setShowDataEntry(true)}
          className="w-full justify-start space-x-3"
          variant="outline"
        >
          <Plus className="h-5 w-5" />
          <span>Quick Add Data</span>
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 py-8">
          <div className="flex h-16 shrink-0 items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">LivestockMS</h1>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <AlertsSidebar />
            </div>
          </div>
          <NavContent />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-card px-4 shadow-sm">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">LivestockMS</h1>
              </div>
              <NavContent />
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">LivestockMS</h1>
          </div>
          <NotificationCenter />
          <AlertsSidebar />
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {showDataEntry ? (
            <AdvancedDataEntry onClose={() => setShowDataEntry(false)} />
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
