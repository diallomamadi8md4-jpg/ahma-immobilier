"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, Info, TrendingUp, MapPin, Ruler, Home } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { BIEN_TYPE_LABEL, formatFCFA, formatNumber } from "@/lib/utils";

type Stat = {
  quartier: string;
  type: string;
  locationRate: number | null;
  saleRate: number | null;
  count: number;
};

export function Estimateur({
  stats, quartiers, types, globalLoc, globalVente, sample,
}: {
  stats: Stat[];
  quartiers: string[];
  types: string[];
  globalLoc: number;
  globalVente: number;
  sample: number;
}) {
  const [usage, setUsage] = useState<"location" | "vente">("location");
  const [quartier, setQuartier] = useState(quartiers[0] ?? "");
  const [type, setType] = useState(types[0] ?? "appartement");
  const [surface, setSurface] = useState(120);
  const [chambres, setChambres] = useState(3);

  const result = useMemo(() => {
    const key = usage === "location" ? "locationRate" : "saleRate";
    const exact = stats.find((s) => s.quartier === quartier && s.type === type);
    const sameQuartier = stats.filter((s) => s.quartier === quartier && s[key] !== null);
    const sameType = stats.filter((s) => s.type === type && s[key] !== null);

    const rate =
      exact?.[key] ??
      (sameQuartier.length
        ? Math.round(sameQuartier.reduce((a, s) => a + (s[key] as number), 0) / sameQuartier.length)
        : null) ??
      (sameType.length
        ? Math.round(sameType.reduce((a, s) => a + (s[key] as number), 0) / sameType.length)
        : null) ??
      (usage === "location" ? globalLoc : globalVente);

    const source = exact?.[key]
      ? `${exact.count} bien${exact.count > 1 ? "s" : ""} comparable${exact.count > 1 ? "s" : ""} à ${quartier}`
      : sameQuartier.length
      ? `Moyenne observée à ${quartier}`
      : sameType.length
      ? `Moyenne observée pour les ${BIEN_TYPE_LABEL[type]?.toLowerCase() ?? type}s`
      : "Moyenne générale du catalogue";

    const bonus = 1 + Math.min(Math.max(chambres, 0), 6) * 0.015;
    const central = Math.round((rate * surface * bonus) / 1000) * 1000;
    return {
      low: Math.round((central * 0.88) / 1000) * 1000,
      central,
      high: Math.round((central * 1.12) / 1000) * 1000,
      rate,
      source,
    };
  }, [usage, quartier, type, surface, chambres, stats, globalLoc, globalVente]);

  return (
    <>
      <section className="border-b border-surface bg-brand-gradient text-white">
        <div className="container py-12">
          <nav className="text-xs text-white/60">
            <Link href="/" className="hover:text-white">Accueil</Link> <span className="mx-1">/</span> Estimation
          </nav>
          <h1 className="mt-3 flex items-center gap-3 font-display text-3xl font-bold sm:text-4xl">
            <Sparkles className="h-8 w-8 text-gold-300" /> Estimer mon bien
          </h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Une estimation indicative calculée à partir des {sample} biens suivis par Ahma Immobilier, ajustée selon le quartier, le type et la surface.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card p-6 sm:p-8">
            <div className="inline-flex rounded-xl border border-surface bg-surface-2 p-1">
              {(["location", "vente"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUsage(u)}
                  aria-pressed={usage === u}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    usage === u ? "bg-brand-gradient text-white shadow-soft" : "text-ink-500 hover:text-ink-800 dark:text-ink-300"
                  }`}
                >
                  {u === "location" ? "Loyer mensuel" : "Prix de vente"}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="est-quartier" className="label-base flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Quartier</label>
                <select id="est-quartier" value={quartier} onChange={(e) => setQuartier(e.target.value)} className="input-base">
                  {quartiers.map((q) => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="est-type" className="label-base flex items-center gap-1.5"><Home className="h-3.5 w-3.5" /> Type de bien</label>
                <select id="est-type" value={type} onChange={(e) => setType(e.target.value)} className="input-base">
                  {types.map((t) => <option key={t} value={t}>{BIEN_TYPE_LABEL[t] ?? t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="est-surface" className="label-base flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5" /> Surface (m²)</label>
                <input id="est-surface" type="number" min={10} max={10000} value={surface} onChange={(e) => setSurface(Math.max(10, Number(e.target.value) || 10))} className="input-base" />
                <input type="range" aria-label="Surface (curseur)" min={20} max={1000} step={10} value={Math.min(surface, 1000)} onChange={(e) => setSurface(Number(e.target.value))} className="mt-2 w-full accent-brand-600" />
              </div>
              <div>
                <label htmlFor="est-chambres" className="label-base">Nombre de chambres</label>
                <select id="est-chambres" value={chambres} onChange={(e) => setChambres(Number(e.target.value))} className="input-base">
                  {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n === 0 ? "Studio / aucun" : `${n} chambre${n > 1 ? "s" : ""}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-6 flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              {result.source}. Le prix au m² retenu est de <strong className="text-ink-700 dark:text-ink-200">{formatNumber(result.rate)} FCFA/m²</strong>.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="relative overflow-hidden rounded-2xl bg-gold-gradient p-7 text-white shadow-soft-lg">
              <div className="absolute -right-10 -bottom-14 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <p className="text-sm text-white/75">Estimation {usage === "location" ? "du loyer mensuel" : "du prix de vente"}</p>
                <p className="mt-3 font-display text-4xl font-bold tracking-tight">{formatFCFA(result.central)}</p>
                <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span>Fourchette : {formatFCFA(result.low)} – {formatFCFA(result.high)}</span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Comment est calculée l&apos;estimation ?</h2>
              <ol className="mt-4 space-y-3 text-sm text-ink-600 dark:text-ink-300">
                <li><strong>1.</strong> Prix au m² moyen observé dans le catalogue pour le quartier et le type sélectionnés.</li>
                <li><strong>2.</strong> Ajustement de 1,5 % par chambre supplémentaire.</li>
                <li><strong>3.</strong> Fourchette de ±12 % pour refléter les variations de standing et d&apos;emplacement.</li>
              </ol>
              <p className="mt-4 text-xs text-ink-400">Cette estimation ne constitue pas une expertise immobilière. Un conseiller peut affiner l&apos;analyse.</p>
            </div>

            <LinkButton href="/#contact" variant="outline" className="justify-center">
              Demander une estimation personnalisée
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
