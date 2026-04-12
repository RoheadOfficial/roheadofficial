import { Link, useLocation } from "wouter";
import { useGetPublicHome } from "@workspace/api-client-react";
import { Music, Video, User, Settings, Disc3 } from "lucide-react";
import { useEffect } from "react";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: homeData } = useGetPublicHome();

  const theme = homeData?.settings?.defaultTheme || "dark";

  useEffect(() => {
    document.documentElement.className = theme === "light" ? "" : "dark";
    if (theme !== "light" && theme !== "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  const navLinks = [
    { href: "/", label: "Discover", icon: Disc3 },
    { href: "/music", label: "Music", icon: Music },
    { href: "/videos", label: "Videos", icon: Video },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              {homeData?.settings?.profileImageUrl ? (
                <img src={homeData.settings.profileImageUrl} alt="Logo" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  RH
                </div>
              )}
              <span className="font-bold text-lg tracking-tight">
                {homeData?.settings?.siteName || "ROHEAD OFFICIAL"}
              </span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </div>
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <User className="w-4 h-4" />
                <span className="hidden md:inline">Creator Login</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile nav bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border/40 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className={`flex flex-col items-center justify-center w-16 h-full gap-1 cursor-pointer ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}>
                <link.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <main className="flex-1 pt-16 pb-16 md:pb-0 relative z-10">
        {children}
      </main>
      
      <footer className="border-t border-border/40 bg-card/30 backdrop-blur-md py-8 pb-24 md:pb-8 relative z-10 mt-auto">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          {homeData?.settings?.footerText || "© 2025 ROHEAD OFFICIAL. All rights reserved."}
        </div>
      </footer>
    </div>
  );
}
