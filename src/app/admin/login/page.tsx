"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, ArrowLeft, ShieldCheck, Building2, ReceiptText, BarChart3 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ahma-immobilier.ci");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Connexion impossible.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erreur réseau, réessayez.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visuel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#06251f] p-12 text-white lg:flex">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/properties/villa-piscine.webp')" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#06251f]/95 via-[#06251f]/85 to-[#0b3d30]/80" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative"><Logo onDark /></div>
        <div className="relative max-w-lg">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-400" /> Espace administration
          </span>
          <h2 className="section-title mt-6 text-4xl font-semibold leading-tight">
            L&apos;excellence en gestion immobilière, à portée de clic.
          </h2>
          <p className="mt-4 text-white/75">
            Suivez vos biens, vos locataires et vos encaissements depuis un tableau de bord unique, élégant et sécurisé.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/85">
            {[
              { icon: BarChart3, t: "Indicateurs clés en temps réel" },
              { icon: Building2, t: "Catalogue de biens structuré" },
              { icon: ReceiptText, t: "Quittances de loyer PDF en un clic" },
              { icon: ShieldCheck, t: "Données sécurisées et confidentielles" },
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
        <div className="relative border-t border-white/10 pt-6 text-xs text-white/50">© {new Date().getFullYear()} Ahma Immobilier — Abidjan</div>
      </div>

      {/* Formulaire */}
      <div className="flex items-center justify-center bg-bg px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden"><Logo /></div>
          <h1 className="section-title mt-8 text-3xl font-semibold text-ink-900 dark:text-white lg:mt-0">Connexion administrateur</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">Accédez à votre espace de gestion.</p>

          <div className="surface-panel mt-6 p-7 sm:p-9">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label-base flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-base"
                placeholder="admin@ahma-immobilier.ci"
              />
            </div>
            <div>
              <label className="label-base flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>

          <div className="mt-5 rounded-xl border border-dashed border-surface bg-surface-2 p-3 text-xs text-ink-500 dark:text-ink-400">
            <span className="font-semibold text-ink-700 dark:text-ink-200">Accès réservé</span>
            <br />
            Les identifiants sont transmis par l&apos;agence. En cas d&apos;oubli, contactez l&apos;administrateur.
          </div>
          </div>

          <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 dark:text-ink-400">
            <ArrowLeft className="h-4 w-4" /> Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
