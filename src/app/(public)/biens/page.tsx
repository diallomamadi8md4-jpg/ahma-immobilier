import Link from "next/link";
import { ChevronRight, SlidersHorizontal, X } from "lucide-react";
import prisma from "@/lib/prisma";
import { CatalogView } from "@/components/public/catalog-view";
import { CatalogFilters } from "@/components/public/catalog-filters";
import { BIEN_TYPE_LABEL, parseArray } from "@/lib/utils";
import { criteriaToQuery, matchBien, parseCriteria, sortBiens, type SearchCriteria } from "@/lib/search";
import { SaveSearch } from "@/components/public/save-search";
import type { CardBien } from "@/components/public/property-card";

export const revalidate = 0;

const STATUT_LABEL: Record<string, string> = {
  disponible: "Disponible",
  loue: "Loué",
  reserve: "Réservé",
  maintenance: "En maintenance",
};

function buildChips(c: SearchCriteria) {
  const chips: { label: string; href: string }[] = [];
  if (c.q) chips.push({ label: `« ${c.q} »`, href: criteriaToQuery({ ...c, q: "" }) });
  if (c.type) chips.push({ label: BIEN_TYPE_LABEL[c.type] ?? c.type, href: criteriaToQuery({ ...c, type: "" }) });
  if (c.quartier) chips.push({ label: c.quartier, href: criteriaToQuery({ ...c, quartier: "" }) });
  if (c.statut) chips.push({ label: STATUT_LABEL[c.statut] ?? c.statut, href: criteriaToQuery({ ...c, statut: "" }) });
  if (c.loyerMax) chips.push({ label: `≤ ${c.loyerMax.toLocaleString("fr-FR")} FCFA`, href: criteriaToQuery({ ...c, loyerMax: 0 }) });
  if (c.surfaceMin) chips.push({ label: `≥ ${c.surfaceMin} m²`, href: criteriaToQuery({ ...c, surfaceMin: 0 }) });
  if (c.chambres) chips.push({ label: `${c.chambres}+ chambres`, href: criteriaToQuery({ ...c, chambres: 0 }) });
  return chips;
}

export default async function BiensPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const criteres = parseCriteria(searchParams);
  const tous = await prisma.bien.findMany({ orderBy: { createdAt: "desc" } });
  const quartiers = Array.from(new Set(tous.map((b) => b.quartier))).sort();
  const biens = sortBiens(tous.filter((b) => matchBien(b, criteres)), criteres.tri);

  const cards: CardBien[] = biens.map((b) => ({
    id: b.id,
    titre: b.titre,
    type: b.type,
    statut: b.statut,
    quartier: b.quartier,
    superficie: b.superficie,
    nbChambres: b.nbChambres,
    loyer: b.loyer,
    prixVente: b.prixVente,
    accent: b.accent,
    photos: parseArray(b.photos),
  }));

  const chips = buildChips(criteres);
  const disponibles = cards.filter((c) => c.statut === "disponible").length;

  return (
    <>
      <section className="relative overflow-hidden border-b border-surface bg-brand-gradient text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="container relative py-14">
          <nav className="flex items-center gap-1 text-xs text-white/60" aria-label="Fil d’Ariane">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">Nos biens</span>
          </nav>
          <h1 className="section-title mt-4 text-4xl font-semibold sm:text-5xl">
            Trouvez le bien qui vous ressemble
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            {cards.length} bien{cards.length > 1 ? "s" : ""} au catalogue, dont {disponibles} disponible{disponibles > 1 ? "s" : ""}.
            Villas, appartements, bureaux et terrains soigneusement sélectionnés à Abidjan.
          </p>
          <div className="gold-rule mt-6" />
        </div>
      </section>

      <section className="container py-10">
        <div className="flex gap-8">
          {/* Filtres desktop */}
          <div className="surface-panel sticky top-28 hidden h-fit w-[290px] shrink-0 self-start lg:block">
            <CatalogFilters criteres={criteres} quartiers={quartiers} resultCount={cards.length} />
          </div>

          <div className="min-w-0 flex-1">
            {/* Filtres mobile */}
            <details className="surface-panel mb-6 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-ink-900 dark:text-white">
                <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-brand-600" /> Filtrer les biens</span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                  {cards.length} résultat{cards.length > 1 ? "s" : ""}
                </span>
              </summary>
              <div className="border-t border-surface">
                <CatalogFilters criteres={criteres} quartiers={quartiers} resultCount={cards.length} />
              </div>
            </details>

            {chips.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-ink-400">Filtres actifs :</span>
                {chips.map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
                  >
                    {chip.label} <X className="h-3 w-3" />
                  </Link>
                ))}
                <Link href="/biens" className="text-xs font-semibold text-ink-400 underline-offset-4 hover:text-rose-600 hover:underline">
                  Tout effacer
                </Link>
              </div>
            )}

            <SaveSearch criteres={criteres} resultCount={cards.length} />

            <CatalogView cards={cards} />
          </div>
        </div>
      </section>
    </>
  );
}
