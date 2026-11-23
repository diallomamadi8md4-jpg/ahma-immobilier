"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPES: [string, string][] = [
  ["plomberie", "Plomberie / eau"],
  ["electricite", "Électricité"],
  ["climatisation", "Climatisation"],
  ["menage", "Ménage / entretien"],
  ["securite", "Sécurité"],
  ["autre", "Autre"],
];

export function SignalementForm({ biens }: { biens: { id: number; titre: string }[] }) {
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
      const res = await fetch("/api/signalements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bienId: data.get("bienId"),
          nom: data.get("nom"),
          telephone: data.get("telephone"),
          email: data.get("email"),
          type: data.get("type"),
          urgence: data.get("urgence"),
          description: data.get("description"),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Une erreur est survenue.");
      setReference(json.reference ?? "");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (reference) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-ink-900 dark:text-white">Signalement enregistré</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500 dark:text-ink-400">
          Merci, notre équipe technique prendra contact avec vous dans les plus brefs délais.
        </p>
        <p className="mt-4 inline-block rounded-lg bg-surface-2 px-4 py-2 text-xs font-semibold text-ink-600 dark:text-ink-300">
          Référence : {reference}
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={() => setReference("")}>Nouveau signalement</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 sm:p-8">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink-900 dark:text-white">
        <Wrench className="h-5 w-5 text-brand-600" /> Décrire le problème
      </h2>
      <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Tous les champs marqués d&apos;un astérisque sont obligatoires.</p>

      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="sig-site">Site</label><input id="sig-site" name="site" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sig-bien" className="label-base">Bien concerné *</label>
          <select id="sig-bien" name="bienId" required className="input-base">
            <option value="">Sélectionnez un bien</option>
            {biens.map((b) => <option key={b.id} value={b.id}>{b.titre}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sig-type" className="label-base">Type de problème *</label>
          <select id="sig-type" name="type" required defaultValue="" className="input-base">
            <option value="" disabled>Choissez une catégorie</option>
            {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="sig-nom" className="label-base">Nom complet *</label>
          <input id="sig-nom" name="nom" required minLength={2} maxLength={120} className="input-base" placeholder="Votre nom" />
        </div>
        <div>
          <label htmlFor="sig-tel" className="label-base">Téléphone *</label>
          <input id="sig-tel" name="telephone" type="tel" required minLength={8} className="input-base" placeholder="+225 ..." />
        </div>
        <div>
          <label htmlFor="sig-email" className="label-base">Email</label>
          <input id="sig-email" name="email" type="email" className="input-base" placeholder="vous@email.com" />
        </div>
        <div>
          <label htmlFor="sig-urgence" className="label-base">Niveau d&apos;urgence *</label>
          <select id="sig-urgence" name="urgence" defaultValue="moyenne" className="input-base">
            <option value="faible">Faible</option>
            <option value="moyenne">Moyenne</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="sig-desc" className="label-base">Description *</label>
          <textarea id="sig-desc" name="description" required minLength={10} maxLength={3000} rows={5} className="input-base resize-none" placeholder="Décrivez précisément le problème, le lieu et depuis quand il persiste…" />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
        {loading ? "Envoi en cours…" : "Envoyer le signalement"}
      </Button>
    </form>
  );
}
