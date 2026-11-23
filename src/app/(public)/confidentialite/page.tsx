import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <div className="container max-w-3xl py-14">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 dark:text-ink-400">
        <ArrowLeft className="h-4 w-4" /> Accueil
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink-900 dark:text-white">Politique de confidentialité</h1>
      <div className="card mt-8 space-y-6 p-7 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
        <div className="flex items-start gap-3 rounded-xl bg-brand-50 p-4 dark:bg-brand-500/10">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <p>Les données transmises via le formulaire de demande de visite servent exclusivement à vous recontacter et à organiser la visite du bien concerné.</p>
        </div>
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Données collectées</h2>
          <p className="mt-2">Lors d&apos;une demande de visite, nous collectons : nom, téléphone, adresse email (facultative), date souhaitée et message éventuel. Ces informations sont conservées dans notre espace de gestion interne.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Finalité et durée de conservation</h2>
          <p className="mt-2">Les données sont utilisées par nos conseillers pour répondre à votre demande. Elles sont conservées pour une durée proportionnée à la relation commerciale, puis supprimées ou anonymisées.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Vos droits</h2>
          <p className="mt-2">Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en écrivant à <a className="text-brand-600 hover:underline" href="mailto:contact@ahma-immobilier.ci">contact@ahma-immobilier.ci</a>.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Cookies</h2>
          <p className="mt-2">Le site utilise uniquement le stockage local du navigateur pour mémoriser vos favoris, vos biens consultés récemment et votre préférence de thème. Aucun cookie publicitaire n&apos;est déposé.</p>
        </section>
      </div>
    </div>
  );
}
