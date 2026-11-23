"use client";

import { useState } from "react";
import { CalendarCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VisiteForm({ bienId, bienTitre }: { bienId: number; bienTitre: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/visites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bienId,
          nom: data.get("nom"),
          telephone: data.get("telephone"),
          email: data.get("email"),
          dateSouhaitee: data.get("date"),
          message: data.get("message"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Une erreur est survenue.");

      setReference(json.reference ?? "");
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 font-display text-lg font-bold text-ink-900 dark:text-white">Demande enregistrée</h3>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          Merci ! Un conseiller Ahma vous recontactera sous 24 h pour organiser la visite de «&nbsp;{bienTitre}&nbsp;».
        </p>
        {reference && (
          <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs font-semibold tracking-wide text-ink-600 dark:text-ink-300">
            Référence : {reference}
          </p>
        )}
        <Button variant="outline" size="sm" className="mt-5" onClick={() => setSent(false)}>
          Nouvelle demande
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6">
      <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Demander une visite</h3>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Réponse sous 24 h, sans engagement.</p>

      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="site">Site</label>
        <input id="site" name="site" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="visite-nom" className="label-base">Nom complet *</label>
            <input id="visite-nom" name="nom" required minLength={2} maxLength={120} placeholder="Votre nom" className="input-base" />
          </div>
          <div>
            <label htmlFor="visite-tel" className="label-base">Téléphone *</label>
            <input id="visite-tel" name="telephone" type="tel" required minLength={6} maxLength={40} placeholder="+225 ..." className="input-base" />
          </div>
        </div>
        <div>
          <label htmlFor="visite-email" className="label-base">Email</label>
          <input id="visite-email" name="email" type="email" maxLength={160} placeholder="vous@email.com" className="input-base" />
        </div>
        <div>
          <label htmlFor="visite-date" className="label-base">Date souhaitée</label>
          <input id="visite-date" name="date" type="date" className="input-base" />
        </div>
        <div>
          <label htmlFor="visite-message" className="label-base">Message</label>
          <textarea id="visite-message" name="message" rows={3} maxLength={2000} placeholder="Vos précisions…" className="input-base resize-none" />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <Button type="submit" className="mt-5 w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
        {loading ? "Envoi en cours…" : "Envoyer la demande"}
      </Button>
    </form>
  );
}
