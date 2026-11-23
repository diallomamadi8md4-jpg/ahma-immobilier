"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Building2, Wallet, Ruler } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const TYPES: [string, string][] = [
  ["", "Tous les types"],
  ["villa", "Villa"],
  ["appartement", "Appartement"],
  ["bureau", "Bureau"],
  ["terrain", "Terrain"],
  ["commerce", "Local commercial"],
  ["magasin", "Magasin"],
];

const BUDGETS: [string, string][] = [
  ["", "Budget max"],
  ["500000", "500 000 FCFA"],
  ["1000000", "1 000 000 FCFA"],
  ["1500000", "1 500 000 FCFA"],
  ["2500000", "2 500 000 FCFA"],
  ["5000000", "5 000 000 FCFA"],
];

const SURFACES: [string, string][] = [
  ["", "Surface min"],
  ["50", "50 m²"],
  ["100", "100 m²"],
  ["150", "150 m²"],
  ["200", "200 m²"],
  ["400", "400 m²"],
];

export function HomeSearch({ quartiers }: { quartiers: string[] }) {
  const router = useRouter();
  const [type, setType] = useState("");
  const [quartier, setQuartier] = useState("");
  const [loyerMax, setLoyerMax] = useState("");
  const [surfaceMin, setSurfaceMin] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (type) p.set("type", type);
    if (quartier) p.set("quartier", quartier);
    if (loyerMax) p.set("loyerMax", loyerMax);
    if (surfaceMin) p.set("surfaceMin", surfaceMin);
    router.push(`/biens?${p.toString()}`);
  }

  const field =
    "flex items-center gap-2 rounded-xl bg-white/[0.09] px-3 transition focus-within:bg-white/[0.14]";
  const select =
    "h-11 w-full bg-transparent text-sm font-medium text-white outline-none [&>option]:bg-[#06251f] [&>option]:text-white";

  return (
    <form onSubmit={submit} className="mt-10 rounded-2xl border border-white/15 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-xl">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <div className={field}>
          <Building2 className="h-4 w-4 shrink-0 text-gold-300" />
          <label htmlFor="search-type" className="sr-only">Type de bien</label>
          <select id="search-type" value={type} onChange={(e) => setType(e.target.value)} className={select}>
            {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className={field}>
          <MapPin className="h-4 w-4 shrink-0 text-gold-300" />
          <label htmlFor="search-quartier" className="sr-only">Quartier</label>
          <select id="search-quartier" value={quartier} onChange={(e) => setQuartier(e.target.value)} className={select}>
            <option value="">Tous les quartiers</option>
            {quartiers.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
        <div className={field}>
          <Wallet className="h-4 w-4 shrink-0 text-gold-300" />
          <label htmlFor="search-budget" className="sr-only">Loyer maximum</label>
          <select id="search-budget" value={loyerMax} onChange={(e) => setLoyerMax(e.target.value)} className={select}>
            {BUDGETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className={field}>
          <Ruler className="h-4 w-4 shrink-0 text-gold-300" />
          <label htmlFor="search-surface" className="sr-only">Surface minimum</label>
          <select id="search-surface" value={surfaceMin} onChange={(e) => setSurfaceMin(e.target.value)} className={select}>
            {SURFACES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <button type="submit" className={buttonVariants({ variant: "gold", size: "lg" })}>
          <Search className="h-4 w-4" /> Rechercher
        </button>
      </div>
    </form>
  );
}
