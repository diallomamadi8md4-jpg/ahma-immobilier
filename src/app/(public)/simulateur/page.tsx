import Link from "next/link";
import { Calculator, ShieldCheck, Sparkles } from "lucide-react";
import { Simulateur } from "@/components/public/simulateur";

export const metadata = {
  title: "Simulateur de financement",
  description: "Estimez vos mensualités de crédit immobilier ou votre capacité d'emprunt à Abidjan.",
};

export default function SimulateurPage() {
  return (
    <>
      <section className="border-b border-surface bg-brand-gradient text-white">
        <div className="container py-12">
          <nav className="text-xs text-white/60">
            <Link href="/" className="hover:text-white">Accueil</Link> <span className="mx-1">/</span> Simulateur
          </nav>
          <h1 className="mt-3 flex items-center gap-3 font-display text-3xl font-bold sm:text-4xl">
            <Calculator className="h-8 w-8 text-gold-300" /> Simulateur de financement
          </h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Mensualités, apport, durée, taux ou capacité d&apos;emprunt : obtenez une estimation claire en quelques secondes, sans engagement.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <Simulateur />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Sparkles, title: "Estimation instantanée", text: "Les résultats se mettent à jour dès que vous modifiez un paramètre." },
            { icon: ShieldCheck, title: "Sans engagement", text: "Aucune donnée n'est transmise : le calcul se fait dans votre navigateur." },
            { icon: Calculator, title: "Aide à la décision", text: "Comparez vos scénarios avant de contacter un conseiller Ahma." },
          ].map((b) => (
            <div key={b.title} className="card p-5">
              <b.icon className="h-5 w-5 text-brand-600" />
              <h3 className="mt-3 font-semibold text-ink-900 dark:text-white">{b.title}</h3>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
