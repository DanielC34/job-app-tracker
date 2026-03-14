import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { LayoutDashboard, Briefcase, FileText, LogOut, Menu } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications", label: "Applications", icon: Briefcase },
  { to: "/resumes", label: "Resumes", icon: FileText },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-card/50 min-h-screen sticky top-0 shrink-0">
        <div className="p-6 h-14 flex items-center mb-6">
          <Link to="/dashboard" className="font-heading text-xl font-bold text-primary">
            ApplyFlow
          </Link>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={location.pathname.startsWith(item.to) ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t mt-auto">
          <p className="text-xs text-muted-foreground px-4 mb-2 truncate">{user?.email}</p>
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={signOut}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header & Drawer */}
      <header className="md:hidden sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/dashboard" className="font-heading text-lg font-bold text-primary">
            ApplyFlow
          </Link>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <div className="p-6 h-14 flex items-center border-b mb-4">
                <SheetTitle className="font-heading text-xl font-bold text-primary">ApplyFlow</SheetTitle>
              </div>
              <nav className="flex-1 px-4 flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={location.pathname.startsWith(item.to) ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t mt-auto">
                <p className="text-xs text-muted-foreground px-4 mb-2 truncate">{user?.email}</p>
                <Button variant="ghost" className="w-full justify-start gap-3" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden pt-4 pb-8 px-4 md:py-8 md:px-8">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
