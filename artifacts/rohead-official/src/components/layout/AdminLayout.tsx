import { Link, useLocation } from "wouter";
import { Music, Video, Users, Settings, LayoutDashboard, LogOut, ArrowLeft } from "lucide-react";
import { useGetMe } from "@workspace/api-client-react";
import { getAuthHeader, removeToken } from "@/lib/auth";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({
    request: { headers: getAuthHeader() },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleLogout = () => {
    removeToken();
    setLocation("/");
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/music", label: "Music", icon: Music },
    { href: "/admin/videos", label: "Videos", icon: Video },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold tracking-tight">Public Site</span>
            </div>
          </Link>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="mb-4 px-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Control Center
            </h2>
          </div>
          {navLinks.map((link) => {
            const isActive = location === link.href || (link.href !== "/admin" && location.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer text-sm font-medium ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}>
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </div>
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium">
              {user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-medium truncate">{user?.email}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 border-b bg-card flex items-center px-4 md:hidden shrink-0">
          <Link href="/">
            <ArrowLeft className="w-5 h-5 mr-4 text-muted-foreground cursor-pointer" />
          </Link>
          <span className="font-bold">Control Center</span>
        </header>
        
        <div className="flex-1 overflow-auto bg-muted/30">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card flex justify-around p-2 pb-safe z-50">
        {navLinks.map((link) => {
          const isActive = location === link.href || (link.href !== "/admin" && location.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href}>
              <div className={`p-2 rounded-lg cursor-pointer ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                <link.icon className="w-5 h-5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
