"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SidebarContent, ADMIN_NAV } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "@/components/ui/command-palette";
import { cn } from "@/lib/utils";

export function AdminShell({
  user,
  children,
}: {
  user: { nom: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const c = localStorage.getItem("ahma-sidebar");
    if (c === "collapsed") setCollapsed(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCollapse = () =>
    setCollapsed((c) => {
      const n = !c;
      localStorage.setItem("ahma-sidebar", n ? "collapsed" : "expanded");
      return n;
    });

  const title = pageTitle(pathname);

  return (
    <div className="min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden bg-brand-950 transition-all duration-300 lg:flex lg:flex-col",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-brand-950 animate-fade-in-fast">
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className={cn("transition-all duration-300", collapsed ? "lg:pl-20" : "lg:pl-64")}>
        <Topbar onMenu={() => setMobileOpen(true)} user={user} title={title} />
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}

function pageTitle(pathname: string): string {
  if (pathname === "/admin") return "Tableau de bord";
  for (const item of ADMIN_NAV) {
    if (item.href !== "/admin" && (pathname === item.href || pathname.startsWith(item.href + "/"))) {
      return item.label;
    }
  }
  return "Administration";
}
