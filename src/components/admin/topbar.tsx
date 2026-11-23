"use client";

import Link from "next/link";
import { Menu, Search, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { initials } from "@/lib/utils";

export function Topbar({
  onMenu,
  user,
  title,
}: {
  onMenu: () => void;
  user: { nom: string; email: string; poste?: string };
  title: string;
}) {
  const parts = user.nom.split(" ");
  return (
    <header className="sticky top-0 z-30 glass border-b border-surface">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface bg-surface text-ink-700 lg:hidden dark:text-ink-200"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="font-display text-base font-bold text-ink-900 sm:text-lg dark:text-white">
            {title}
          </h1>
          <p className="hidden text-xs text-ink-400 sm:block">Espace d&apos;administration Ahma Immobilier</p>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("ahma:cmdk"))}
            className="hidden items-center gap-2 rounded-xl border border-surface bg-surface px-3 py-2 text-sm text-ink-400 transition hover:text-brand-700 lg:flex"
            aria-label="Recherche globale"
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Rechercher…</span>
            <kbd className="ml-2 rounded border border-surface px-1.5 py-0.5 text-[10px] text-ink-400">⌘K</kbd>
          </button>
          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-2 rounded-xl border border-surface bg-surface px-3 py-2 text-sm font-medium text-ink-600 transition hover:text-brand-700 sm:inline-flex dark:text-ink-200"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden md:inline">Voir le site</span>
          </Link>
          <ThemeToggle />
          <Link
            href="/admin/mon-compte"
            title="Mon compte"
            className="flex items-center gap-2.5 rounded-xl border border-surface bg-surface px-2 py-1.5 transition hover:border-brand-500/40 hover:bg-surface-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">
              {initials(parts[0], parts[1])}
            </div>
            <div className="hidden leading-tight sm:block">
              <div className="text-xs font-semibold text-ink-800 dark:text-ink-100">{user.nom}</div>
              {user.poste && (
                <div className="truncate text-[10px] font-medium text-gold-600 dark:text-gold-400">{user.poste}</div>
              )}
              <div className="max-w-[150px] truncate text-[10px] text-ink-400">{user.email}</div>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
