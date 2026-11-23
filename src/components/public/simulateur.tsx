"use client";

import { useMemo, useState } from "react";
import { Calculator, Home, Wallet, Info, TrendingUp } from "lucide-react";
import { formatFCFA, formatNumber } from "@/lib/utils";

function mensualite(capital: number, tauxAnnuel: number, annees: number): number {
  if (capital <= 0 || annees <= 0) return 0;
  const i = tauxAnnuel / 100 / 12;
  const n = annees * 12;
  if (i === 0) return capital / n;
  return (capital * i) / (1 - Math.pow(1 + i, -n));
}

export function Simulateur() {
  const [mode, setMode] = useState<"achat" | "capacite">("achat");
  const [prix, setPrix] = useState(60_000_000);
  const [apport, setApport] = useState(12_000_000);
  const [annees, setAnnees] = useState(15);
  const [taux, setTaux] = useState(7.5);
  const [revenus, setRevenus] = useState(800_000);
  const [charges, setCharges] = useState(150_000);

  const result = useMemo(() => {
    if (mode === "achat") {
      const emprunt = Math.max(0, prix - apport);
      const m = mensualite(emprunt, taux, annees);
      const total = m * annees * 12;
      return {
        principale: m,
        details: [
          { label: "Prix du bien", value: formatFCFA(prix) },
          { label: "Apport personnel", value: formatFCFA(apport) },
          { label: "Montant emprunté", value: formatFCFA(emprunt) },
          { label: "Durée", value: `${annees} ans (${annees * 12} mensualités)` },
          { label: "Taux annuel", value: `${taux.toLocaleString("fr-FR")} %` },
          { label: "Coût total du crédit", value: formatFCFA(Math.max(0, total - emprunt)) },
          { label: "Total à rembourser", value: formatFCFA(total) },
        ],
        note: "Frais de notaire et assurance emprunteur non inclus. Estimation indicative.",
      };
    }
    const disposable = Math.max(0, revenus - charges);
    const capaciteMensuelle = disposable * 0.35;
    const empruntMax = (() => {
      const i = taux / 100 / 12;
      const n = annees * 12;
      if (i === 0) return capaciteMensuelle * n;
      return capaciteMensuelle * ((1 - Math.pow(1 + i, -n)) / i);
    })();
    return {
      principale: capaciteMensuelle,
      details: [
        { label: "Revenus mensuels", value: formatFCFA(revenus) },
        { label: "Charges mensuelles", value: formatFCFA(charges) },
        { label: "Revenu disponible", value: formatFCFA(disposable) },
        { label: "Effort maximal (35 %)", value: formatFCFA(capaciteMensuelle) },
        { label: "Durée", value: `${annees} ans` },
        { label: "Taux annuel", value: `${taux.toLocaleString("fr-FR")} %` },
        { label: "Capacité d'emprunt", value: formatFCFA(empruntMax) },
      ],
      note: "La capacité d'emprunt est estimée à 35 % du revenu disponible, hors apport personnel.",
    };
  }, [mode, prix, apport, annees, taux, revenus, charges]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="card p-6 sm:p-8">
        <div className="inline-flex rounded-xl border border-surface bg-surface-2 p-1">
          {(["achat", "capacite"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                mode === m ? "bg-brand-gradient text-white shadow-soft" : "text-ink-500 hover:text-ink-800 dark:text-ink-300"
              }`}
            >
              {m === "achat" ? "Mensualités d'un achat" : "Ma capacité d'emprunt"}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          {mode === "achat" ? (
            <>
              <Field label="Prix du bien" value={prix} onChange={setPrix} step={1_000_000} min={1_000_000} max={500_000_000} suffix="FCFA" />
              <Field label="Apport personnel" value={apport} onChange={setApport} step={500_000} min={0} max={prix} suffix="FCFA" />
              <div className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-ink-500 dark:text-ink-400">
                Soit {prix > 0 ? Math.round((apport / prix) * 100) : 0} % du prix en apport.
              </div>
            </>
          ) : (
            <>
              <Field label="Revenus mensuels" value={revenus} onChange={setRevenus} step={50_000} min={100_000} max={20_000_000} suffix="FCFA" />
              <Field label="Charges mensuelles" value={charges} onChange={setCharges} step={25_000} min={0} max={revenus} suffix="FCFA" />
            </>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="sim-annees" className="label-base">Durée du prêt : {annees} ans</label>
              <input id="sim-annees" type="range" min={2} max={25} value={annees} onChange={(e) => setAnnees(Number(e.target.value))} className="w-full accent-brand-600" />
              <div className="flex justify-between text-xs text-ink-400"><span>2 ans</span><span>25 ans</span></div>
            </div>
            <div>
              <label htmlFor="sim-taux" className="label-base">Taux annuel : {taux.toLocaleString("fr-FR")} %</label>
              <input id="sim-taux" type="range" min={2} max={15} step={0.1} value={taux} onChange={(e) => setTaux(Number(e.target.value))} className="w-full accent-gold-500" />
              <div className="flex justify-between text-xs text-ink-400"><span>2 %</span><span>15 %</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-7 text-white shadow-soft-lg">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm text-white/70">
              {mode === "achat" ? <Home className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
              {mode === "achat" ? "Mensualité estimée" : "Mensualité maximale"}
            </div>
            <p className="mt-3 font-display text-4xl font-bold tracking-tight">
              {formatNumber(Math.round(result.principale))} <span className="text-lg font-medium text-white/80">FCFA / mois</span>
            </p>
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/70">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {result.note}
            </p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-brand-600" /> Détail du calcul
          </h3>
          <dl className="mt-4 divide-y divide-[var(--border)]">
            {result.details.map((d) => (
              <div key={d.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <dt className="text-ink-500 dark:text-ink-400">{d.label}</dt>
                <dd className="text-right font-semibold text-ink-800 dark:text-ink-100">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <a href="/biens" className="text-center text-sm font-semibold text-brand-600 hover:underline">
          Voir les biens correspondant à mon budget →
        </a>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, step, min, max, suffix,
}: {
  label: string; value: number; onChange: (n: number) => void;
  step: number; min: number; max: number; suffix: string;
}) {
  return (
    <div>
      <label htmlFor={`field-${label}`} className="label-base">{label}</label>
      <div className="flex items-center gap-2">
        <input
          id={`field-${label}`}
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
          className="input-base"
        />
        <span className="shrink-0 text-xs font-semibold text-ink-400">{suffix}</span>
      </div>
      <input
        type="range"
        aria-label={`${label} (curseur)`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-brand-600"
      />
    </div>
  );
}
