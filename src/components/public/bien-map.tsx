"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Navigation, Maximize2 } from "lucide-react";
import { PropertyImage } from "@/components/ui/property-image";
import { Badge } from "@/components/ui/badge";
import { BIEN_STATUT_META, BIEN_TYPE_LABEL, cn, formatFCFA, formatNumber } from "@/lib/utils";

export type MapBien = {
  id: number;
  titre: string;
  type: string;
  statut: string;
  quartier: string;
  superficie: number;
  loyer: number | null;
  prixVente: number | null;
  accent: string;
  photos: string[];
};

const POSITIONS: Record<string, [number, number]> = {
  "Yopougon": [140, 175],
  "Le Plateau": [360, 205],
  "Cocody Ambassades": [510, 150],
  "Cocody Riviera Golf 3": [590, 95],
  "Cocody Angré": [660, 215],
  "Bingerville": [725, 305],
  "Treichville": [295, 335],
  "Marcory": [390, 355],
  "Marcory Zone 4": [465, 395],
  "Grand-Bassam": [735, 450],
};

export function BienMap({ biens }: { biens: MapBien[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, MapBien[]>();
    biens.forEach((b) => map.set(b.quartier, [...(map.get(b.quartier) ?? []), b]));
    return Array.from(map, ([quartier, items]) => ({ quartier, items }));
  }, [biens]);

  const [active, setActive] = useState<string | null>(groups[0]?.quartier ?? null);
  const current = groups.find((g) => g.quartier === active);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="card overflow-hidden p-2 sm:p-3">
        <div className="relative overflow-hidden rounded-xl bg-[#eaf2ec]">
          <svg viewBox="0 0 800 520" className="block h-auto w-full" role="img" aria-label="Carte des quartiers d'Abidjan avec les biens Ahma Immobilier">
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="#d7e5da" strokeWidth="1" />
              </pattern>
              <linearGradient id="lagoon" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#b8dfe4" />
                <stop offset="100%" stopColor="#8fc7d2" />
              </linearGradient>
            </defs>

            <rect width="800" height="520" fill="url(#map-grid)" />
            {/* Lagune / baie */}
            <path d="M210 250 C300 215, 420 235, 500 275 C570 310, 640 315, 700 290 L760 330 C690 380, 580 375, 490 340 C400 305, 300 300, 235 320 Z" fill="url(#lagoon)" opacity="0.9" />
            <path d="M470 0 C500 60, 540 85, 585 90 L610 0 Z" fill="url(#lagoon)" opacity="0.55" />
            {/* Axes routiers */}
            <g stroke="#ffffff" strokeWidth="7" fill="none" opacity="0.9" strokeLinecap="round">
              <path d="M60 120 C220 150, 320 190, 460 170 C580 150, 680 190, 780 240" />
              <path d="M120 420 C240 360, 330 330, 430 360 C540 390, 620 430, 760 470" />
              <path d="M360 30 C370 130, 350 230, 300 320 C270 380, 250 450, 230 510" />
              <path d="M640 40 C610 140, 650 240, 700 330 C730 390, 740 460, 750 510" />
            </g>
            <g stroke="#cbd9cd" strokeWidth="1.5" fill="none" strokeDasharray="4 6">
              <path d="M60 120 C220 150, 320 190, 460 170 C580 150, 680 190, 780 240" />
              <path d="M120 420 C240 360, 330 330, 430 360 C540 390, 620 430, 760 470" />
            </g>
            <text x="350" y="292" fill="#4d8896" fontSize="13" fontWeight="600" opacity="0.75" transform="rotate(7 350 292)">Lagune d&apos;Abidjan</text>
            <text x="30" y="40" fill="#7a9a83" fontSize="12" fontWeight="700" letterSpacing="2">ABIDJAN · PLAN DES QUARTIERS</text>

            {groups.map((g, idx) => {
              const pos = POSITIONS[g.quartier] ?? [80 + (idx % 5) * 150, 70 + Math.floor(idx / 5) * 130];
              const [x, y] = pos;
              const isActive = active === g.quartier;
              return (
                <g
                  key={g.quartier}
                  transform={`translate(${x} ${y})`}
                  onClick={() => setActive(g.quartier)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`${g.quartier}, ${g.items.length} bien(s)`}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActive(g.quartier); }}
                >
                  <circle r={isActive ? 26 : 20} fill={isActive ? "#047857" : "#ffffff"} stroke={isActive ? "#fbbf24" : "#047857"} strokeWidth={isActive ? 3 : 2} className="transition-all" />
                  <text textAnchor="middle" dy="6" fontSize="14" fontWeight="800" fill={isActive ? "#ffffff" : "#047857"}>{g.items.length}</text>
                  <text y={isActive ? 44 : 38} textAnchor="middle" fontSize="11" fontWeight="700" fill="#334e3d" className="pointer-events-none">
                    {g.quartier.length > 18 ? `${g.quartier.slice(0, 16)}…` : g.quartier}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-ink-600 shadow-soft backdrop-blur dark:bg-ink-900/80 dark:text-ink-200">
            <Navigation className="h-3.5 w-3.5 text-brand-600" />
            Cliquez sur un quartier pour voir les biens
          </div>
        </div>
      </div>

      <div className="card flex max-h-[520px] flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface bg-surface-2 px-5 py-4">
          <div>
            <p className="flex items-center gap-1.5 font-display text-lg font-bold text-ink-900 dark:text-white">
              <MapPin className="h-5 w-5 text-brand-600" /> {current?.quartier ?? "Quartier"}
            </p>
            <p className="mt-0.5 text-xs text-ink-400">{current?.items.length ?? 0} bien(s) référencé(s)</p>
          </div>
          <Maximize2 className="h-4 w-4 text-ink-300" />
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {current?.items.map((b) => {
            const meta = BIEN_STATUT_META[b.statut] ?? BIEN_STATUT_META.disponible;
            return (
              <Link key={b.id} href={`/biens/${b.id}`} className="group flex gap-3 rounded-xl border border-surface p-2.5 transition hover:border-brand-300 hover:bg-surface-2">
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                  <PropertyImage accent={b.accent} type={b.type} rounded={false} src={b.photos[0]} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-ink-900 group-hover:text-brand-600 dark:text-white">{b.titre}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{BIEN_TYPE_LABEL[b.type] ?? b.type} · {formatNumber(b.superficie)} m²</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-brand-700 dark:text-brand-400">
                      {b.loyer ? `${formatFCFA(b.loyer)}/mois` : b.prixVente ? formatFCFA(b.prixVente) : "Sur devis"}
                    </span>
                    <Badge className={cn(meta.cls, "text-[10px]")}>{meta.label}</Badge>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-surface p-4">
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g.quartier}
                onClick={() => setActive(g.quartier)}
                aria-pressed={active === g.quartier}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                  active === g.quartier
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-surface bg-surface text-ink-500 hover:text-brand-600 dark:text-ink-400"
                )}
              >
                {g.quartier} <span className="opacity-70">({g.items.length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
