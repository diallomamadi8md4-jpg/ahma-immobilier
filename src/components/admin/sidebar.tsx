"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserSquare2,
  FileSignature,
  ReceiptText,
  CalendarCheck,
  MessageSquare,
  MessagesSquare,
  BellRing,
  Wrench,
  Download,
  ChevronLeft,
  ChevronRight,
  Globe,
  ShieldCheck,
  UserCog,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

export const ADMIN_NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/biens", label: "Biens", icon: Building2 },
  { href: "/admin/locataires", label: "Locataires", icon: Users },
  { href: "/admin/proprietaires", label: "Propriétaires", icon: UserSquare2 },
  { href: "/admin/contrats", label: "Contrats", icon: FileSignature },
  { href: "/admin/paiements", label: "Paiements & Quittances", icon: ReceiptText },
  { href: "/admin/visites", label: "Demandes de visite", icon: CalendarCheck },
  { href: "/admin/messages", label: "Messages reçus", icon: MessageSquare },
  { href: "/admin/messagerie", label: "Messagerie interne", icon: MessagesSquare },
  { href: "/admin/alertes", label: "Alertes & recherches", icon: BellRing },
  { href: "/admin/signalements", label: "Signalements", icon: Wrench },
  { href: "/admin/comptes", label: "Comptes administrateurs", icon: ShieldCheck },
  { href: "/admin/mon-compte", label: "Mon compte", icon: UserCog },
  { href: "/api/export/biens", label: "Exporter les biens", icon: Download },
];

const group = (...hrefs: string[]) => ADMIN_NAV.filter((item) => hrefs.includes(item.href));

const NAV_GROUPS = [
  { label: "Pilotage", items: group("/admin") },
  {
    label: "Patrimoine",
    items: group("/admin/biens", "/admin/locataires", "/admin/proprietaires", "/admin/contrats", "/admin/paiements"),
  },
  {
    label: "Relation client",
    items: group("/admin/visites", "/admin/messages", "/admin/messagerie", "/admin/alertes", "/admin/signalements"),
  },
  { label: "Administration", items: group("/admin/comptes", "/admin/mon-compte") },
  { label: "Outils", items: group("/api/export/biens") },
];

export function SidebarContent({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/10 px-4",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {collapsed ? <Logo compact /> : <Logo onDark />}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-300 transition hover:bg-white/10 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-brand-gradient text-white shadow-soft"
                        : "text-ink-300 hover:bg-white/5 hover:text-white",
                      collapsed && "justify-center"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href="/"
          onClick={onNavigate}
          title={collapsed ? "Voir le site" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-300 transition hover:bg-white/5 hover:text-white",
            collapsed && "justify-center"
          )}
        >
          <Globe className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="truncate">Voir le site</span>}
        </Link>
        <LogoutButton collapsed={collapsed} />
      </div>
    </div>
  );
}
