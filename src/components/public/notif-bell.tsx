"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { ALERTE_TOKEN_KEY } from "@/components/public/save-search";

export function NotifBell() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const token = localStorage.getItem(ALERTE_TOKEN_KEY);
      const res = await fetch(token ? `/api/alertes?token=${encodeURIComponent(token)}` : "/api/alertes", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();
      setCount(Number(json.count) || 0);
    } catch {
      // Silencieux : la cloche reste disponible même hors ligne.
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    window.addEventListener("ahma:alertes", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("ahma:alertes", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return (
    <Link
      href="/alertes"
      aria-label={count > 0 ? `${count} nouvelle${count > 1 ? "s" : ""} alerte${count > 1 ? "s" : ""}` : "Mes alertes"}
      title="Mes alertes"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface bg-surface text-ink-600 transition hover:text-brand-600 dark:text-ink-300"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-white shadow-soft">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
