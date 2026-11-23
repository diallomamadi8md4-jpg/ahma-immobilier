"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2, Users, LockKeyhole, Loader2, AlertCircle, ArrowLeft,
  ShieldCheck, Clock3, FileText, ArrowUpRight, Mail, Phone,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import type { PortailRole } from "@/lib/portail-auth";

export function PortailLogin({ role }: { role: PortailRole }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLocataire = role === "locataire";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/portail/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, email, telephone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Connexion impossible.");
      router.push(isLocataire ? "/espace-locataire" : "/espace-proprietaire");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  const other = isLocataire ? "/connexion-proprietaire" : "/connexion-locataire";

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      {/* Panneau signature */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#06251f] p-12 text-white lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('/images/properties/villa-contemporaine.webp')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#06251f]/95 via-[#06251f]/85 to-[#0b3d30]/80" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative">
          <Logo onDark />
        </div>

        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
            Espace client sécurisé
          </span>
          <h2 className="section-title mt-6 text-4xl font-semibold leading-tight">
            {isLocataire ? "Votre logement, suivi au quotidien." : "Votre patrimoine, piloté en toute sérénité."}
          </h2>
          <p className="mt-4 text-white/75">
            {isLocataire
              ? "Contrat, loyers, quittances et demandes d'intervention : tout votre suivi locatif au même endroit."
              : "Revenus, biens, locataires et messagerie : gardez une vue claire et à jour sur vos investissements."}
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            {[
              { icon: ShieldCheck, t: "Données strictement confidentielles" },
              { icon: Clock3, t: "Informations disponibles 24 h/24" },
              { icon: FileText, t: "Quittances PDF téléchargeables" },
            ].map((f) => (
              <li key={f.t} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-gold-300">
                  <f.icon className="h-4 w-4" />
                </span>
                {f.t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} Ahma Immobilier · Abidjan
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center bg-bg px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden"><Logo /></div>
          <Link href="/" className="mt-8 inline-flex items-center gap-1.5 text-sm text-ink-500 transition hover:text-brand-600 dark:text-ink-400">
            <ArrowLeft className="h-4 w-4" /> Retour au site
          </Link>

          <div className="surface-panel mt-6 p-7 sm:p-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-soft">
              {isLocataire ? <Users className="h-7 w-7" /> : <Building2 className="h-7 w-7" />}
            </div>
            <h1 className="section-title mt-5 text-3xl font-semibold text-ink-900 dark:text-white">
              Espace {isLocataire ? "locataire" : "propriétaire"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              Connectez-vous avec l&apos;email et le téléphone enregistrés auprès de l&apos;agence.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <label className="block">
                <span className="label-base flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Adresse email</span>
                <input
                  id="portail-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-base"
                  placeholder="vous@email.com"
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="label-base flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Téléphone</span>
                <input
                  id="portail-tel"
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="input-base"
                  placeholder="+225 07 00 00 00 00"
                  autoComplete="tel"
                />
              </label>
              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                {loading ? "Connexion…" : "Accéder à mon espace"}
              </Button>
            </form>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-surface pt-5 text-xs">
              <Link href={other} className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline">
                {isLocataire ? "Je suis propriétaire" : "Je suis locataire"} <ArrowUpRight className="h-3 w-3" />
              </Link>
              <Link href="/contact" className="text-ink-400 hover:text-brand-600">Besoin d&apos;aide ?</Link>
            </div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-ink-400">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-500" />
            Accès réservé aux clients Ahma Immobilier. Vos données ne sont jamais partagées.
          </p>
        </div>
      </div>
    </div>
  );
}
