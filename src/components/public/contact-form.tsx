"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUJETS: [string, string][] = [
  ["location", "Je cherche un bien à louer"],
  ["vente", "Je souhaite acheter"],
  ["gestion", "Je suis propriétaire / gestion locative"],
  ["quittance", "Question sur une quittance ou un paiement"],
  ["autre", "Autre demande"],
];

export function ContactForm() {
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
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: data.get("nom"), email: data.get("email"), telephone: data.get("telephone"),
          sujet: data.get("sujet"), contenu: data.get("contenu"),
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
        <h2 className="mt-4 font-display text-xl font-bold text-ink-900 dark:text-white">Message envoyé</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500 dark:text-ink-400">
          Merci pour votre message. Un conseiller Ahma vous répondra sous 24 heures ouvrées.
        </p>
        <p className="mt-4 inline-block rounded-lg bg-surface-2 px-4 py-2 text-xs font-semibold text-ink-600 dark:text-ink-300">
          Référence : {reference}
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={() => setReference("")}>Nouveau message</Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 sm:p-8">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="msg-site">Site</label><input id="msg-site" name="site" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="msg-nom" className="label-base">Nom complet *</label>
          <input id="msg-nom" name="nom" required minLength={2} className="input-base" placeholder="Votre nom" />
        </div>
        <div>
          <label htmlFor="msg-email" className="label-base">Email *</label>
          <input id="msg-email" name="email" type="email" required className="input-base" placeholder="vous@email.com" />
        </div>
        <div>
          <label htmlFor="msg-tel" className="label-base">Téléphone</label>
          <input id="msg-tel" name="telephone" type="tel" className="input-base" placeholder="+225 ..." />
        </div>
        <div>
          <label htmlFor="msg-sujet" className="label-base">Objet *</label>
          <select id="msg-sujet" name="sujet" defaultValue="location" className="input-base">
            {SUJETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="msg-contenu" className="label-base">Votre message *</label>
          <textarea id="msg-contenu" name="contenu" required minLength={10} maxLength={3000} rows={6} className="input-base resize-none" placeholder="Bonjour, je souhaiterais …" />
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Envoi en cours…" : "Envoyer le message"}
      </Button>
    </form>
  );
}
