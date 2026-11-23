import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";

export const metadata = {
  title: "Contact",
  description: "Contactez l'équipe Ahma Immobilier à Abidjan pour un projet de location, d'achat ou de gestion locative.",
};

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-surface bg-brand-gradient text-white">
        <div className="container py-12">
          <nav className="text-xs text-white/60">
            <Link href="/" className="hover:text-white">Accueil</Link> <span className="mx-1">/</span> Contact
          </nav>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Parlons de votre projet</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Une question, un projet de location ou de vente ? Écrivez-nous, un conseiller vous répond sous 24 heures.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Nos coordonnées</h2>
              <ul className="mt-4 space-y-4 text-sm text-ink-600 dark:text-ink-300">
                <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><span>Cocody Riviera 2, Abidjan<br />Côte d&apos;Ivoire</span></li>
                <li className="flex items-center gap-3"><Phone className="h-5 w-5 shrink-0 text-brand-600" /><a href="tel:+2250712275713" className="hover:text-brand-600">+225 07 12 27 57 13</a></li>
                <li className="flex items-center gap-3"><Mail className="h-5 w-5 shrink-0 text-brand-600" /><a href="mailto:contact@ahma-immobilier.ci" className="hover:text-brand-600">contact@ahma-immobilier.ci</a></li>
                <li className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /><span>Lundi – Vendredi : 8 h – 18 h<br />Samedi : 9 h – 13 h</span></li>
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-soft">
              <MessageCircle className="h-7 w-7 text-gold-300" />
              <h3 className="mt-4 font-display text-lg font-bold">Besoin d&apos;une réponse rapide ?</h3>
              <p className="mt-2 text-sm text-white/75">Appelez-nous directement, nos conseillers sont à votre écoute pendant les heures ouvrées.</p>
              <a href="tel:+2250712275713" className="mt-4 inline-block rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/25">+225 07 12 27 57 13</a>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
