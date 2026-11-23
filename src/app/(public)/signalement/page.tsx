import Link from "next/link";
import prisma from "@/lib/prisma";
import { SignalementForm } from "@/components/public/signalement-form";
import { ShieldCheck, Clock3 } from "lucide-react";

export const revalidate = 0;

export const metadata = {
  title: "Signaler un problème",
  description: "Signalez un incident technique ou un problème dans l'un des biens gérés par Ahma Immobilier.",
};

export default async function SignalementPage() {
  const biens = await prisma.bien.findMany({
    select: { id: true, titre: true },
    orderBy: { titre: "asc" },
  });

  return (
    <>
      <section className="border-b border-surface bg-brand-gradient text-white">
        <div className="container py-12">
          <nav className="text-xs text-white/60">
            <Link href="/" className="hover:text-white">Accueil</Link> <span className="mx-1">/</span> Signalement
          </nav>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Signaler un problème</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Fuite, panne, problème de sécurité : décrivez la situation, notre équipe technique se charge du suivi.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <SignalementForm biens={biens} />
          <aside className="space-y-4">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Comment ça marche ?</h2>
              <ol className="mt-4 space-y-4">
                {[
                  ["1", "Décrivez", "Indiquez le bien concerné et la nature du problème."],
                  ["2", "Nous analysons", "Le service technique évalue l'urgence et contacte l'intervenant."],
                  ["3", "Suivi", "Vous êtes informé de l'intervention et de sa résolution."],
                ].map(([n, t, d]) => (
                  <li key={n} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{n}</span>
                    <div><p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{t}</p><p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{d}</p></div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="card p-6">
              <ShieldCheck className="h-6 w-6 text-brand-600" />
              <h3 className="mt-3 font-semibold text-ink-900 dark:text-white">Données confidentielles</h3>
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">Vos coordonnées sont utilisées uniquement pour le suivi de ce signalement.</p>
            </div>
            <div className="card p-6">
              <Clock3 className="h-6 w-6 text-gold-600" />
              <h3 className="mt-3 font-semibold text-ink-900 dark:text-white">Urgence</h3>
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">En cas d&apos;urgence vitale (incendie, danger immédiat), appelez les secours puis prévenez-nous.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
