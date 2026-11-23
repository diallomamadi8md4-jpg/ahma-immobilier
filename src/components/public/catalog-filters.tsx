import Link from "next/link";
import {
  Search, Home, MapPin, CircleDot, Wallet, Ruler, BedDouble, ArrowDownWideNarrow, RotateCcw, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BIEN_TYPE_LABEL } from "@/lib/utils";
import type { SearchCriteria } from "@/lib/search";

const TYPES = ["villa", "appartement", "bureau", "terrain", "commerce", "magasin"];
const STATUTS = [
  ["disponible", "Disponible"],
  ["reserve", "Réservé"],
  ["loue", "Loué"],
  ["maintenance", "En maintenance"],
] as const;

function Field({
  icon: Icon, label, name, defaultValue, options, placeholder,
}: {
  icon: typeof Search;
  label: string;
  name: string;
  defaultValue: string;
  options: [string, string][];
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label-base flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-brand-500" /> {label}
      </span>
      <select name={name} defaultValue={defaultValue} className="input-base">
        <option value="">{placeholder ?? "Tous"}</option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
    </label>
  );
}

export function CatalogFilters({
  criteres, quartiers, resultCount,
}: {
  criteres: SearchCriteria;
  quartiers: string[];
  resultCount: number;
}) {
  return (
    <form action="/biens" method="get" className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 border-b border-surface pb-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900 dark:text-white">
            <SlidersHorizontal className="h-4 w-4 text-brand-600" /> Affiner
          </h2>
          <p className="mt-1 text-xs text-ink-400">{resultCount} résultat{resultCount > 1 ? "s" : ""}</p>
        </div>
        <Link href="/biens" className="inline-flex items-center gap-1 text-xs font-semibold text-ink-400 transition hover:text-rose-600">
          <RotateCcw className="h-3 w-3" /> Effacer
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="label-base flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-brand-500" /> Mot-clé
          </span>
          <input name="q" defaultValue={criteres.q} placeholder="Titre, quartier, description…" className="input-base" />
        </label>

        <Field
          icon={Home}
          label="Type de bien"
          name="type"
          defaultValue={criteres.type}
          options={TYPES.map((t) => [t, BIEN_TYPE_LABEL[t] ?? t])}
        />

        <Field
          icon={MapPin}
          label="Quartier"
          name="quartier"
          defaultValue={criteres.quartier}
          options={quartiers.map((q) => [q, q])}
        />

        <Field
          icon={CircleDot}
          label="Statut"
          name="statut"
          defaultValue={criteres.statut}
          options={STATUTS.map(([v, l]) => [v, l])}
        />

        <div className="grid grid-cols-2 gap-3">
          <Field
            icon={Wallet}
            label="Loyer max"
            name="loyerMax"
            defaultValue={String(criteres.loyerMax || "")}
            placeholder="Sans limite"
            options={[
              ["500000", "500 k"],
              ["1000000", "1 M"],
              ["1500000", "1,5 M"],
              ["2500000", "2,5 M"],
              ["5000000", "5 M"],
            ]}
          />
          <Field
            icon={Ruler}
            label="Surface min"
            name="surfaceMin"
            defaultValue={String(criteres.surfaceMin || "")}
            placeholder="Toutes"
            options={[["50", "50 m²"], ["100", "100 m²"], ["150", "150 m²"], ["200", "200 m²"], ["400", "400 m²"]]}
          />
        </div>

        <Field
          icon={BedDouble}
          label="Chambres minimum"
          name="chambres"
          defaultValue={String(criteres.chambres || "")}
          placeholder="Toutes"
          options={[["1", "1+ chambre"], ["2", "2+ chambres"], ["3", "3+ chambres"], ["4", "4+ chambres"]]}
        />

        <div className="border-t border-surface pt-4">
          <Field
            icon={ArrowDownWideNarrow}
            label="Trier par"
            name="tri"
            defaultValue={criteres.tri}
            placeholder="Plus récents"
            options={[
              ["loyer_asc", "Loyer croissant"],
              ["loyer_desc", "Loyer décroissant"],
              ["surface", "Plus grande surface"],
            ]}
          />
        </div>
      </div>

      <Button type="submit" className="mt-6 w-full">
        <Search className="h-4 w-4" /> Voir les {resultCount} résultat{resultCount > 1 ? "s" : ""}
      </Button>
    </form>
  );
}
