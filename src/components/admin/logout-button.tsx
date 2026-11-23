"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions";
import { cn } from "@/lib/utils";

export function LogoutButton({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        title={collapsed ? "Déconnexion" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-300 transition hover:bg-rose-500/15 hover:text-rose-300",
          collapsed && "justify-center"
        )}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        {!collapsed && <span>Déconnexion</span>}
      </button>
    </form>
  );
}
