"use client";

import { useState } from "react";
import Link from "next/link";
import { BellPlus, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";
import type { SearchCriteria } from "@/lib/search";

export const ALERTE_TOKEN_KEY = "ahma-alertes-token";

export function SaveSearch({
  criteres, resultCount,
}: {
  criteres: SearchCriteria;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/recherches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          nom: data.get("nom"),
          criteres,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Une erreur est survenue.");
      localStorage.setItem(ALERTE_TOKEN_KEY, json.token);
      window.dispatchEvent(new CustomEvent("ahma:alertes"));
      setToken(json.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (token) {
    return (
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm dark:border-brand-500/30 dark:bg-brand-500/10">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-600 dark:text-brand-300" />
        <span className="text-ink-700 dark:text-ink-200">
          <strong>Recherche enregistrée.</strong> Vous serez prévenu dès qu&apos;un bien correspondant sera ajouté.
        </span>
        <Link href={`/alertes?token=${token}`} className="font-semibold text-brand-700 underline dark:text-brand-300">
          Gérer mes alertes
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition",
          open
            ? "border-brand-300 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
            : "border-surface bg-surface text-ink-700 hover:border-brand-300 hover:text-brand-700 dark:text-ink-200"
        )}
      >
        <BellPlus className="h-4 w-4" /> Enregistrer cette recherche
        <span className="rounded-full bg-brand-50 px-1.5 text-xs text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
          {formatNumber(resultCount)} bien{resultCount > 1 ? "s" : ""}
        </span>
      </button>

      {open && (
        <form onSubmit={onSubmit} className="card mt-3 max-w-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-base font-bold text-ink-900 dark:text-white">Recevoir les nouveautés</h2>
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">
                Nous vous préviendrons dès qu&apos;un nouveau bien correspond à vos critères.
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="text-ink-400 hover:text-ink-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="save-nom" className="label-base">Nom (facultatif)</label>
              <input id="save-nom" name="nom" className="input-base" placeholder="Votre nom" />
            </div>
            <div>
              <label htmlFor="save-email" className="label-base">Email *</label>
              <input id="save-email" name="email" type="email" required className="input-base" placeholder="vous@email.com" />
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </p>
          )}
          <Button type="submit" size="sm" className="mt-4" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellPlus className="h-4 w-4" />}
            {loading ? "Enregistrement…" : "Créer l'alerte"}
          </Button>
        </form>
      )}
    </div>
  );
}
