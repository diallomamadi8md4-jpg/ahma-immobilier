import Link from "next/link";
import { MapPin, Maximize2, BedDouble, ArrowUpRight } from "lucide-react";
import { PropertyImage } from "@/components/ui/property-image";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { CompareButton } from "@/components/public/compare-button";
import {
  BIEN_STATUT_META,
  BIEN_TYPE_LABEL,
  formatFCFA,
  formatNumber,
  cn,
} from "@/lib/utils";

export type CardBien = {
  id: number;
  titre: string;
  type: string;
  statut: string;
  quartier: string;
  superficie: number;
  nbChambres: number | null;
  loyer: number | null;
  prixVente: number | null;
  accent: string;
  photos: string[];
};

export function PropertyCard({ bien }: { bien: CardBien }) {
  const meta = BIEN_STATUT_META[bien.statut] ?? BIEN_STATUT_META.disponible;
  const price = bien.loyer ? `${formatFCFA(bien.loyer)}/mois` : bien.prixVente ? formatFCFA(bien.prixVente) : "Sur devis";

  return (
    <article className="group card card-interactive relative overflow-hidden">
      <Link href={`/biens/${bien.id}`} className="absolute inset-0 z-10" aria-label={`Découvrir ${bien.titre}`} />

      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]">
          <PropertyImage
            accent={bien.accent}
            type={bien.type}
            variant={bien.id}
            rounded={false}
            className="h-full w-full"
            src={bien.photos[0]}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/5 to-ink-950/10" />

        <div className="absolute inset-x-4 top-4 z-20 flex items-start justify-between gap-2">
          <Badge className="border-white/20 bg-white/90 text-[11px] font-semibold text-ink-800 shadow-sm backdrop-blur-md dark:bg-ink-900/80 dark:text-ink-100">
            {BIEN_TYPE_LABEL[bien.type] ?? bien.type}
          </Badge>
          <Badge className={cn("border-white/20 text-[11px] font-semibold shadow-sm backdrop-blur-md", meta.cls)}>
            {meta.label}
          </Badge>
        </div>

        <div className="absolute inset-x-4 bottom-4 z-20 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
              {bien.loyer ? "Loyer mensuel" : bien.prixVente ? "Prix de vente" : "Tarif"}
            </span>
            <span className="mt-0.5 block truncate font-display text-base font-bold text-white drop-shadow-sm">
              {price}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <CompareButton id={bien.id} />
            <FavoriteButton id={bien.id} />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
              <MapPin className="h-3 w-3" /> {bien.quartier}
            </p>
            <h3 className="font-editorial mt-1.5 line-clamp-1 text-xl font-semibold text-ink-900 transition-colors group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
              {bien.titre}
            </h3>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-surface bg-surface-2 text-ink-400 transition-all duration-300 group-hover:border-brand-500 group-hover:bg-brand-gradient group-hover:text-white">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-surface pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-ink-600 dark:text-ink-300">
            <Maximize2 className="h-3.5 w-3.5 text-brand-500" /> {formatNumber(bien.superficie)} m²
          </span>
          {bien.nbChambres ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-ink-600 dark:text-ink-300">
              <BedDouble className="h-3.5 w-3.5 text-brand-500" /> {bien.nbChambres} chambre{bien.nbChambres > 1 ? "s" : ""}
            </span>
          ) : null}
          <span className="ml-auto text-xs font-semibold text-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-brand-400">
            Voir le bien
          </span>
        </div>
      </div>
    </article>
  );
}
