"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Users,
  UserSquare2,
  FileSignature,
  ReceiptText,
  CornerDownLeft,
} from "lucide-react";

type Hit = { type: string; id: number; label: string; sub?: string; href: string };

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bien: Building2,
  locataire: Users,
  proprietaire: UserSquare2,
  contrats: FileSignature,
  paiement: ReceiptText,
};
const TYPE_LABEL: Record<string, string> = {
  bien: "Bien",
  locataire: "Locataire",
  proprietaire: "Propriétaire",
  contrats: "Contrat",
  paiement: "Paiement",
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onCmd = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ahma:cmdk", onCmd);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ahma:cmdk", onCmd);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
    setQ("");
    setResults([]);
    setActive(0);
  }, [open]);

  useEffect(() => {
    if (!open || q.trim().length < 1) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        setResults(d.results ?? []);
        setActive(0);
      } catch {
        setResults([]);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [q, open]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onNav(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      const r = results[active];
      if (r) go(r.href);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-surface bg-surface shadow-soft-lg animate-scale-in">
        <div className="flex items-center gap-3 border-b border-surface px-4">
          <Search className="h-5 w-5 text-ink-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onNav}
            placeholder="Rechercher un bien, un locataire, un contrat…"
            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-ink-400"
          />
          <kbd className="hidden rounded border border-surface px-1.5 py-0.5 text-[10px] text-ink-400 sm:block">ESC</kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-ink-400">
              {q ? "Aucun résultat" : "Commencez à taper pour rechercher…"}
            </div>
          ) : (
            results.map((r, i) => {
              const Icon = ICONS[r.type] ?? Search;
              return (
                <button
                  key={`${r.type}-${r.id}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r.href)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    i === active ? "bg-brand-50 dark:bg-brand-500/15" : "hover:bg-ink-50 dark:hover:bg-ink-800/60"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-brand-600 dark:bg-ink-800 dark:text-brand-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{r.label}</span>
                    {r.sub && <span className="block truncate text-xs text-ink-400">{r.sub}</span>}
                  </span>
                  <span className="rounded-md bg-ink-50 px-1.5 py-0.5 text-[10px] font-medium text-ink-400 dark:bg-ink-800">
                    {TYPE_LABEL[r.type] ?? r.type}
                  </span>
                  {i === active && <CornerDownLeft className="h-4 w-4 shrink-0 text-ink-300" />}
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-surface px-4 py-2 text-[11px] text-ink-400">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-surface px-1">↑</kbd>
            <kbd className="rounded border border-surface px-1">↓</kbd> naviguer
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="h-3 w-3" /> ouvrir
          </span>
        </div>
      </div>
    </div>
  );
}
