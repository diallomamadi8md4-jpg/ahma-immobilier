import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="border-t border-surface bg-surface">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500 dark:text-ink-400">
              Agence de gestion immobilière premium à Abidjan. Gestion locative,
              ventes et suivi transparent pour propriétaires et locataires.
            </p>
            <Link
              href="/#contact"
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-surface px-3 py-2 text-xs font-semibold text-brand-700 transition hover:border-brand-500 dark:text-brand-400"
            >
              Prendre contact <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Navigation</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-500 dark:text-ink-400">
              <li><Link href="/" className="hover:text-brand-600">Accueil</Link></li>
              <li><Link href="/biens" className="hover:text-brand-600">Nos biens</Link></li>
              <li><Link href="/carte" className="hover:text-brand-600">Carte des biens</Link></li>
              <li><Link href="/comparer" className="hover:text-brand-600">Comparateur</Link></li>
              <li><Link href="/alertes" className="hover:text-brand-600">Mes alertes</Link></li>
              <li><Link href="/contact" className="hover:text-brand-600">Contact</Link></li>
              <li><Link href="/admin" className="hover:text-brand-600">Espace administration</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Nos services</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-500 dark:text-ink-400">
              <li><Link href="/simulateur" className="hover:text-brand-600">Simulateur de financement</Link></li>
              <li><Link href="/estimer" className="hover:text-brand-600">Estimer un bien</Link></li>
              <li><Link href="/signalement" className="hover:text-brand-600">Signaler un problème</Link></li>
              <li><Link href="/connexion-locataire" className="hover:text-brand-600">Espace locataire</Link></li>
              <li><Link href="/connexion-proprietaire" className="hover:text-brand-600">Espace propriétaire</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-ink-500 dark:text-ink-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 text-brand-500" />
                <span>Cocody Riviera 2, Abidjan — Côte d&apos;Ivoire</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-brand-500" />
                <span>+225 07 12 27 57 13</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-brand-500" />
                <a href="mailto:contact@ahma-immobilier.ci" className="hover:text-brand-600">contact@ahma-immobilier.ci</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-surface pt-6 text-xs text-ink-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Ahma Immobilier. Tous droits réservés.</p>
          <p className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-brand-600">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-brand-600">Confidentialité</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
