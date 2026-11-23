"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu, X, LayoutDashboard, UserRound, ChevronDown,
  Phone, Mail,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotifBell } from "@/components/public/notif-bell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS: { href: string; label: string; advanced?: boolean }[] = [
  { href: "/", label: "Accueil" },
  { href: "/biens", label: "Nos biens" },
  { href: "/carte", label: "Carte", advanced: true },
  { href: "/comparer", label: "Comparer", advanced: true },
  { href: "/simulateur", label: "Simulateur", advanced: true },
  { href: "/estimer", label: "Estimer", advanced: true },
  { href: "/#services", label: "Services" },
  { href: "/#apropos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [spaces, setSpaces] = useState(false);
  const [clients, setClients] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : href.startsWith("/#") ? false : pathname.startsWith(href);

  const navLink = (l: { href: string; label: string }) => (
    <Link
      key={l.href}
      href={l.href}
      className={cn(
        "relative rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
        isActive(l.href)
          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
          : "text-ink-600 hover:bg-brand-50/70 hover:text-brand-700 dark:text-ink-200 dark:hover:bg-brand-500/10"
      )}
    >
      {l.label}
      {isActive(l.href) && (
        <span className="absolute inset-x-3 -bottom-[9px] h-0.5 rounded-full bg-gold-400" />
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50">
      {/* Bandeau de contact — signature premium */}
      <div className="hidden bg-[#06251f] text-white/70 lg:block">
        <div className="container flex h-8 items-center justify-between text-[11px]">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            Abidjan · Gestion locative, vente & expertise patrimoniale
          </span>
          <div className="flex items-center gap-5">
            <a href="tel:+2250712275713" className="inline-flex items-center gap-1.5 transition hover:text-white">
              <Phone className="h-3 w-3" /> +225 07 12 27 57 13
            </a>
            <a href="mailto:contact@ahma-immobilier.ci" className="inline-flex items-center gap-1.5 transition hover:text-white">
              <Mail className="h-3 w-3" /> contact@ahma-immobilier.ci
            </a>
          </div>
        </div>
      </div>

      <div className="glass border-b border-surface">
        <nav className="container flex h-16 items-center justify-between gap-4" aria-label="Navigation principale">
          <Link href="/" className="flex items-center" aria-label="Ahma Immobilier — Accueil">
            <Logo />
          </Link>

          <div className="hidden items-center gap-0.5 xl:flex">
            {LINKS.map(navLink)}
          </div>

          <div className="hidden items-center gap-0.5 lg:flex xl:hidden">
            {LINKS.filter((l) => !l.advanced).map(navLink)}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setSpaces((s) => !s); setClients(false); }}
                aria-expanded={spaces}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink-600 hover:bg-brand-50 hover:text-brand-700 dark:text-ink-200"
              >
                Outils <ChevronDown className={cn("h-3.5 w-3.5 transition", spaces && "rotate-180")} />
              </button>
              {spaces && (
                <div className="surface-panel absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden p-1.5">
                  {LINKS.filter((l) => l.advanced).map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setSpaces(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-ink-700 transition hover:bg-brand-50 hover:text-brand-700 dark:text-ink-200 dark:hover:bg-brand-500/10"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <Link
                    href="/signalement"
                    onClick={() => setSpaces(false)}
                    className="mt-1 block rounded-lg border-t border-surface px-3 py-2.5 text-sm text-ink-700 transition hover:bg-brand-50 dark:text-ink-200"
                  >
                    Signaler un problème
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <NotifBell />
            <ThemeToggle />

            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => { setClients((s) => !s); setSpaces(false); }}
                aria-expanded={clients}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
              >
                <UserRound className="h-4 w-4" /> Espace client
                <ChevronDown className={cn("h-3 w-3 transition", clients && "rotate-180")} />
              </button>
              {clients && (
                <div className="surface-panel absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden p-1.5">
                  <Link href="/espace-locataire" onClick={() => setClients(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50 dark:text-ink-200">Mon espace locataire</Link>
                  <Link href="/espace-proprietaire" onClick={() => setClients(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50 dark:text-ink-200">Mon espace propriétaire</Link>
                  <Link href="/alertes" onClick={() => setClients(false)} className="mt-1 block rounded-lg border-t border-surface px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50 dark:text-ink-200">Mes alertes</Link>
                </div>
              )}
            </div>

            <Link href="/admin" className={cn(buttonVariants({ variant: "primary", size: "sm" }), "hidden gap-1.5 md:inline-flex")}>
              <LayoutDashboard className="h-4 w-4" /> Administration
            </Link>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface bg-surface text-ink-700 xl:hidden dark:text-ink-200"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <div
          id="mobile-menu"
          className={cn(
            "overflow-hidden border-t border-surface bg-surface/95 backdrop-blur xl:hidden",
            open ? "max-h-[720px]" : "max-h-0"
          )}
          style={{ transition: "max-height .3s ease" }}
        >
          <div className="container flex flex-col gap-1 py-4">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">Explorer</p>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive(l.href)
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    : "text-ink-700 hover:bg-brand-50 dark:text-ink-200"
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/signalement" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50 dark:text-ink-200">
              Signaler un problème
            </Link>
            <div className="my-2 border-t border-surface" />
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">Vos espaces</p>
            <div className="grid grid-cols-2 gap-2 px-1">
              <Link href="/connexion-locataire" onClick={() => setOpen(false)} className="card card-interactive flex items-center gap-2 p-3 text-xs font-semibold text-ink-700 dark:text-ink-200">
                <UserRound className="h-4 w-4 text-brand-600" /> Locataire
              </Link>
              <Link href="/connexion-proprietaire" onClick={() => setOpen(false)} className="card card-interactive flex items-center gap-2 p-3 text-xs font-semibold text-ink-700 dark:text-ink-200">
                <LayoutDashboard className="h-4 w-4 text-gold-600" /> Propriétaire
              </Link>
            </div>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ variant: "primary", size: "sm" }), "mt-3 w-full")}
            >
              <LayoutDashboard className="h-4 w-4" /> Espace administration
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
