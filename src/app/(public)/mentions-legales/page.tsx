import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return (
    <div className="container max-w-3xl py-14">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 dark:text-ink-400">
        <ArrowLeft className="h-4 w-4" /> Accueil
      </Link>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink-900 dark:text-white">Mentions légales</h1>
      <div className="card mt-8 space-y-6 p-7 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Éditeur du site</h2>
          <p className="mt-2">
            Ahma Immobilier — agence de gestion immobilière sise à Cocody Riviera 2, Abidjan,
            Côte d&apos;Ivoire. Contact : <a className="text-brand-600 hover:underline" href="mailto:contact@ahma-immobilier.ci">contact@ahma-immobilier.ci</a> · +225 07 12 27 57 13.
          </p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Hébergement</h2>
          <p className="mt-2">Le présent service est hébergé sur l&apos;infrastructure mise en œuvre par Ahma Immobilier. Les informations relatives à l&apos;hébergeur peuvent être communiquées sur simple demande.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Propriété intellectuelle</h2>
          <p className="mt-2">L&apos;ensemble des contenus, textes, visuels et éléments graphiques du site est la propriété d&apos;Ahma Immobilier ou de ses partenaires et est protégé par les dispositions légales en vigueur.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Photos</h2>
          <p className="mt-2">Les photographies présentées à titre de démonstration proviennent d&apos;Unsplash et sont utilisées sous licence Unsplash. Elles ne représentent pas nécessairement les biens proposés.</p>
        </section>
        <section>
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Responsabilité</h2>
          <p className="mt-2">Les informations immobilières publiées sont fournies à titre indicatif et ne constituent pas une offre contractuelle. Ahma Immobilier ne saurait être tenue responsable d&apos;une erreur de transcription ou d&apos;une modification des caractéristiques des biens.</p>
        </section>
      </div>
    </div>
  );
}
