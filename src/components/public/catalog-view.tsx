"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Map as MapIcon, Heart, MapPin, Sparkles } from "lucide-react";
import { PropertyCard, type CardBien } from "@/components/public/property-card";
import { cn, BIEN_TYPE_LABEL, formatFCFA } from "@/lib/utils";

const FAV_KEY = "ahma-favoris";

function readIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function CatalogView({ cards }: { cards: CardBien[] }) {
  const [view, setView] = useState<"grille" | "carte">("grille");
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState<number[]>([]);

  useEffect(() => {
    const u = () => setFavs(readIds());
    u();
    window.addEventListener("ahma:favoris", u);
    return () => window.removeEventListener("ahma:favoris", u);
  }, []);

  const shown = favOnly ? cards.filter((c) => favs.includes(c.id)) : cards;
  const quartiers = Array.from(new Set(shown.map((c) => c.quartier))).sort();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-surface pb-4">
        <div>
          <h2 className="font-editorial text-xl font-semibold text-ink-900 dark:text-white">Résultats de votre recherche</h2>
          <p className="mt-0.5 text-xs text-ink-400">{shown.length} bien{shown.length > 1 ? "s" : ""} à découvrir</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border border-surface bg-surface p-1">
          <button
            onClick={() => setView("grille")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
              view === "grille" ? "bg-brand-gradient text-white shadow-soft" : "text-ink-500 hover:text-ink-800 dark:text-ink-300"
            )}
            aria-pressed={view === "grille"}
          >
            <LayoutGrid className="h-4 w-4" /> Grille
          </button>
          <button
            onClick={() => setView("carte")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
              view === "carte" ? "bg-brand-gradient text-white shadow-soft" : "text-ink-500 hover:text-ink-800 dark:text-ink-300"
            )}
            aria-pressed={view === "carte"}
          >
            <MapIcon className="h-4 w-4" /> Par quartier
          </button>
        </div>
        <button
          onClick={() => setFavOnly((f) => !f)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition",
            favOnly
              ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300"
              : "border-surface bg-surface text-ink-600 hover:text-ink-800 dark:text-ink-300"
          )}
          aria-pressed={favOnly}
        >
          <Heart className={cn("h-4 w-4", favOnly && "fill-rose-500 text-rose-500")} />
          Favoris
          <span className="sr-only"> ({favs.length})</span>
          {favs.length > 0 && (
            <span className="rounded-full bg-rose-100 px-1.5 text-xs dark:bg-rose-500/20">{favOnly ? shown.length : favs.length}</span>
          )}
        </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-500/15">
            {favOnly ? <Heart className="h-7 w-7" /> : <Sparkles className="h-7 w-7" />}
          </span>
          <p className="font-editorial text-xl font-semibold text-ink-800 dark:text-ink-100">
            {favOnly ? "Aucun bien dans vos favoris" : "Aucun bien ne correspond à votre recherche"}
          </p>
          <p className="max-w-sm text-sm text-ink-400">
            {favOnly
              ? "Ajoutez des biens à vos favoris pour les retrouver ici."
              : "Essayez d'élargir vos critères ou enregistrez votre recherche pour être alerté des nouveautés."}
          </p>
          {!favOnly && (
            <a href="/biens" className="mt-1 text-sm font-semibold text-brand-600 hover:underline">Réinitialiser les filtres</a>
          )}
        </div>
      ) : view === "grille" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((b) => (
            <PropertyCard key={b.id} bien={b} />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quartiers.map((q) => {
            const items = shown.filter((c) => c.quartier === q);
            return (
              <div key={q} className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-surface bg-surface-2 px-4 py-3">
                  <span className="flex items-center gap-2 font-semibold text-ink-800 dark:text-ink-100">
                    <MapPin className="h-4 w-4 text-brand-500" /> {q}
                  </span>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                    {items.length} bien(s)
                  </span>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {items.map((b) => (
                    <a key={b.id} href={`/biens/${b.id}`} className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-surface-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{b.titre}</div>
                        <div className="text-xs text-ink-400">{BIEN_TYPE_LABEL[b.type] ?? b.type}</div>
                      </div>
                      <div className="shrink-0 text-right text-sm font-semibold text-ink-700 dark:text-ink-200">
                        {b.loyer ? formatFCFA(b.loyer) : b.prixVente ? formatFCFA(b.prixVente) : "—"}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
