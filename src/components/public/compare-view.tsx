"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitCompareArrows, Trash2, X, Check } from "lucide-react";
import { PropertyImage } from "@/components/ui/property-image";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { buttonVariants } from "@/components/ui/button";
import { readCompare, writeCompare } from "@/lib/compare";
import {
  BIEN_STATUT_META,
  BIEN_TYPE_LABEL,
  cn,
  formatFCFA,
  formatNumber,
} from "@/lib/utils";

type Item = {
  id: number;
  titre: string;
  type: string;
  statut: string;
  quartier: string;
  superficie: number;
  nbChambres: number | null;
  nbSallesDeBain: number | null;
  loyer: number | null;
  prixVente: number | null;
  accent: string;
  photos: string[];
  description: string;
  equipements: string[];
};

export function CompareView({ items }: { items: Item[] }) {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const update = () => setIds(readCompare());
    update();
    window.addEventListener("ahma:comparer", update);
    return () => window.removeEventListener("ahma:comparer", update);
  }, []);

  const selected = ids
    .map((id) => items.find((i) => i.id === id))
    .filter((i): i is Item => Boolean(i));

  if (selected.length === 0) {
    return (
      <div className="container py-16">
        <div className="card flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <GitCompareArrows className="h-8 w-8" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-white">Votre comparateur est vide</h1>
          <p className="max-w-md text-sm text-ink-500 dark:text-ink-400">
            Ajoutez jusqu&apos;à 4 biens depuis le catalogue en cliquant sur l&apos;icône de comparaison, puis retrouvez-les ici pour les comparer côte à côte.
          </p>
          <LinkButton href="/biens" variant="primary">Parcourir les biens</LinkButton>
        </div>
      </div>
    );
  }

  const rows: { label: string; render: (i: Item) => React.ReactNode }[] = [
    { label: "Bien", render: (i) => (
      <div className="flex items-center gap-3">
        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg">
          <PropertyImage accent={i.accent} type={i.type} rounded={false} src={i.photos[0]} className="h-full w-full" />
        </div>
        <div className="min-w-0">
          <Link href={`/biens/${i.id}`} className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-brand-600 dark:text-white">{i.titre}</Link>
          <span className="text-xs text-ink-400">{BIEN_TYPE_LABEL[i.type] ?? i.type}</span>
        </div>
      </div>
    ) },
    { label: "Statut", render: (i) => {
      const meta = BIEN_STATUT_META[i.statut] ?? BIEN_STATUT_META.disponible;
      return <Badge className={meta.cls}>{meta.label}</Badge>;
    } },
    { label: "Quartier", render: (i) => <span className="text-sm text-ink-700 dark:text-ink-200">{i.quartier}</span> },
    { label: "Prix", render: (i) => (
      <div className="text-sm font-bold text-brand-700 dark:text-brand-400">
        {i.loyer ? `${formatFCFA(i.loyer)} / mois` : i.prixVente ? formatFCFA(i.prixVente) : "Sur devis"}
      </div>
    ) },
    { label: "Surface", render: (i) => <span className="text-sm text-ink-700 dark:text-ink-200">{formatNumber(i.superficie)} m²</span> },
    { label: "Chambres", render: (i) => <span className="text-sm text-ink-700 dark:text-ink-200">{i.nbChambres ?? "—"}</span> },
    { label: "Salles de bain", render: (i) => <span className="text-sm text-ink-700 dark:text-ink-200">{i.nbSallesDeBain ?? "—"}</span> },
    { label: "Équipements", render: (i) => i.equipements.length ? (
      <ul className="space-y-1">
        {i.equipements.map((e) => (
          <li key={e} className="flex items-center gap-1.5 text-xs text-ink-600 dark:text-ink-300">
            <Check className="h-3 w-3 text-brand-500" /> {e}
          </li>
        ))}
      </ul>
    ) : <span className="text-sm text-ink-400">—</span> },
    { label: "Description", render: (i) => (
      <p className="line-clamp-4 text-xs leading-relaxed text-ink-500 dark:text-ink-400">{i.description || "—"}</p>
    ) },
  ];

  return (
    <>
      <section className="border-b border-surface bg-brand-gradient text-white">
        <div className="container py-12">
          <nav className="text-xs text-white/60">
            <Link href="/" className="hover:text-white">Accueil</Link> <span className="mx-1">/</span> Comparateur
          </nav>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Comparateur de biens</h1>
          <p className="mt-2 max-w-xl text-white/80">
            {selected.length} bien{selected.length > 1 ? "s" : ""} sélectionné{selected.length > 1 ? "s" : ""} — retrouvez d&apos;un coup d&apos;œil les caractéristiques essentielles.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/biens" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            + Ajouter un bien
          </Link>
          <button
            type="button"
            onClick={() => writeCompare([])}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-rose-600 dark:text-ink-400"
          >
            <Trash2 className="h-4 w-4" /> Tout effacer
          </button>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid border-b border-surface" style={{ gridTemplateColumns: `160px repeat(${selected.length}, minmax(0, 1fr))` }}>
                <div className="bg-surface-2 p-4 text-xs font-semibold uppercase tracking-wide text-ink-400">Critère</div>
                {selected.map((i) => (
                  <div key={i.id} className="relative border-l border-surface p-4">
                    <button
                      type="button"
                      onClick={() => writeCompare(ids.filter((x) => x !== i.id))}
                      aria-label={`Retirer ${i.titre} du comparateur`}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <span className="pr-8 text-sm font-bold text-ink-900 dark:text-white">{i.titre}</span>
                  </div>
                ))}
              </div>

              {rows.map((row, idx) => (
                <div
                  key={row.label}
                  className={cn("grid border-b border-surface last:border-0", idx % 2 === 1 && "bg-surface-2/50")}
                  style={{ gridTemplateColumns: `160px repeat(${selected.length}, minmax(0, 1fr))` }}
                >
                  <div className="p-4 text-xs font-semibold uppercase tracking-wide text-ink-400">{row.label}</div>
                  {selected.map((i) => (
                    <div key={i.id} className="border-l border-surface p-4">{row.render(i)}</div>
                  ))}
                </div>
              ))}

              <div className="grid bg-surface-2/50" style={{ gridTemplateColumns: `160px repeat(${selected.length}, minmax(0, 1fr))` }}>
                <div className="p-4" />
                {selected.map((i) => (
                  <div key={i.id} className="border-l border-surface p-4">
                    <LinkButton href={`/biens/${i.id}`} size="sm">Voir la fiche</LinkButton>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
