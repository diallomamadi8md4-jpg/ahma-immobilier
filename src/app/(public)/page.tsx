import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ShieldCheck,
  ReceiptText,
  Search,
  Star,
  CheckCircle2,
  Quote,
  MapPin,
  Phone,
  Sparkles,
  TrendingUp,
  Calculator,
  Map as MapIcon,
  GitCompareArrows,
  UserRound,
  Wrench,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { PropertyCard, type CardBien } from "@/components/public/property-card";
import { HomeSearch } from "@/components/public/home-search";
import { LinkButton } from "@/components/ui/link-button";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatNumber, parseArray } from "@/lib/utils";

export const revalidate = 0;

async function getHomeData() {
  const [biens, nbLocataires, nbContrats] = await Promise.all([
    prisma.bien.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.locataire.count(),
    prisma.contrat.count(),
  ]);

  // Les biens disponibles passent en avant, sans masquer le reste du catalogue.
  const ordreStatut: Record<string, number> = {
    disponible: 0,
    reserve: 1,
    maintenance: 2,
    loue: 3,
  };
  const ordreType: Record<string, number> = {
    villa: 0,
    appartement: 1,
    bureau: 2,
    commerce: 3,
    magasin: 4,
    terrain: 5,
  };
  const featured = [...biens]
    .sort(
      (a, b) =>
        (ordreStatut[a.statut] ?? 9) - (ordreStatut[b.statut] ?? 9) ||
        (ordreType[a.type] ?? 9) - (ordreType[b.type] ?? 9) ||
        b.createdAt.getTime() - a.createdAt.getTime()
    )
    .slice(0, 6)
    .map((b) => ({
      id: b.id,
      titre: b.titre,
      type: b.type,
      statut: b.statut,
      quartier: b.quartier,
      superficie: b.superficie,
      nbChambres: b.nbChambres,
      loyer: b.loyer,
      prixVente: b.prixVente,
      accent: b.accent,
      photos: parseArray(b.photos),
    })) as CardBien[];

  return {
    featured,
    totalBiens: biens.length,
    nbDisponibles: biens.filter((b) => b.statut === "disponible").length,
    nbLocataires,
    nbContrats,
    quartiers: Array.from(new Set(biens.map((b) => b.quartier))).sort(),
  };
}

const SERVICES = [
  {
    icon: Building2,
    title: "Gestion locative",
    text: "Nous gérons vos biens de A à Z : recherche de locataires, suivi des loyers, état des lieux et renouvellements.",
  },
  {
    icon: Search,
    title: "Vente & acquisition",
    text: "Mandats de vente, estimation gratuite et accompagnement juridique pour vos transactions à Abidjan.",
  },
  {
    icon: ReceiptText,
    title: "Quittances & comptabilité",
    text: "Édition de quittances de loyer, suivi des paiements et détection automatique des impayés.",
  },
  {
    icon: ShieldCheck,
    title: "Sérénité garantie",
    text: "Vérification des locataires, gestion des sinistres et reporting transparent pour les propriétaires.",
  },
];

export default async function HomePage() {
  const { featured, totalBiens, nbDisponibles, nbLocataires, nbContrats, quartiers } =
    await getHomeData();

  const stats = [
    { v: `${totalBiens}`, l: "Biens sous gestion" },
    { v: `${nbDisponibles}`, l: "Biens disponibles" },
    { v: `${formatNumber(nbLocataires)}`, l: "Locataires accompagnés" },
    { v: `${formatNumber(nbContrats)}`, l: "Contrats suivis" },
  ];

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-[#06251f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(16,185,129,0.20),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(245,158,11,0.10),transparent_40%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:64px_64px]" />

        <div className="container relative grid items-center gap-14 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          {/* Colonne texte */}
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400 shadow-[0_0_12px_2px_rgba(251,191,36,.55)]" />
              Agence immobilière premium · Abidjan
            </span>

            <h1 className="section-title mt-7 text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-[3.5rem]">
              Votre patrimoine immobilier,{" "}
              <span className="relative whitespace-nowrap text-gold-300">
                entre de bonnes mains
                <svg className="absolute -bottom-2 left-0 h-2 w-full text-gold-500/60" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 5.5C50 1.5 150 1.5 198 5.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
              Gestion locative, vente et suivi comptable : Ahma Immobilier prend soin de
              chaque détail, avec la rigueur et la transparence d&apos;une agence haut de gamme.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/biens" variant="gold" size="lg" className="w-full gap-2 sm:w-auto">
                Explorer nos biens <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <a href="#contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full border-white/25 bg-white/5 text-white hover:bg-white/15 sm:w-auto")}>
                Parler à un expert
              </a>
            </div>

            <HomeSearch quartiers={quartiers} />

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-white/60">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-400" /> Visites accompagnées</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-400" /> Quittances en 1 clic</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-400" /> Reporting transparent</span>
            </div>
          </div>

          {/* Colonne visuelle */}
          <div className="relative mx-auto w-full max-w-[560px] animate-scale-in lg:mx-0">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/properties/villa-piscine.webp"
                alt="Villa contemporaine avec piscine à Abidjan"
                className="aspect-[4/3] w-full object-cover sm:aspect-[5/4]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041a16]/85 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                <div>
                  <div className="font-display text-lg font-bold sm:text-xl">Villa avec piscine</div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-white/70">
                    <MapPin className="h-3.5 w-3.5" /> Cocody Riviera Golf 3
                  </div>
                </div>
                <Link href="/biens" aria-label="Découvrir nos biens">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition hover:scale-105 hover:bg-gold-500">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Vignette secondaire */}
            <div className="absolute -bottom-10 -left-4 hidden w-40 overflow-hidden rounded-2xl border-4 border-[#06251f] shadow-2xl sm:block lg:-left-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/properties/interieur-elegant.webp" alt="Intérieur élégant" className="aspect-square w-full object-cover" />
            </div>

            {/* Carte flottante */}
            <div className="absolute -right-2 -top-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/95 p-3 pr-4 text-ink-900 shadow-2xl backdrop-blur dark:bg-ink-900/95 dark:text-white sm:-right-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15">
                <TrendingUp className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[11px] text-ink-400">Biens disponibles</span>
                <span className="font-display text-lg font-bold leading-tight">{nbDisponibles} à visiter</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bandeau statistiques */}
        <div className="container relative pb-12 pt-6 lg:pb-14">
          <div className="grid grid-cols-2 gap-y-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-6 backdrop-blur sm:grid-cols-4 sm:px-8">
            {stats.map((s, i) => (
              <div
                key={s.l}
                className={`px-2 text-center ${i > 0 ? "sm:border-l sm:border-white/10" : ""}`}
              >
                <div className="font-display text-2xl font-bold sm:text-3xl">{s.v}</div>
                <div className="mt-1 text-xs text-white/60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- SERVICES ---------- */}
      <section id="services" className="container py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-brand-600">
            <span className="h-px w-6 bg-brand-500" /> Nos services <span className="h-px w-6 bg-brand-500" />
          </span>
          <h2 className="section-title mt-4 text-3xl font-semibold text-ink-900 dark:text-white sm:text-4xl">
            Une gestion complète, pensée pour vous
          </h2>
          <div className="mx-auto mt-4 flex justify-center"><div className="gold-rule" /></div>
          <p className="mt-4 text-ink-500 dark:text-ink-400">
            De la mise en location à la quittance de loyer, Ahma Immobilier prend soin de chaque détail.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <div key={s.title} className="card group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-soft-lg dark:hover:border-brand-500/30">
              <span className="absolute right-5 top-4 font-display text-5xl font-extrabold text-ink-900/[0.04] dark:text-white/[0.04]">
                0{i + 1}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition duration-300 group-hover:bg-brand-gradient group-hover:text-white dark:bg-brand-500/15 dark:text-brand-400">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-ink-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- BIENS EN VEDETTE ---------- */}
      <section className="bg-surface-2 py-20 sm:py-24">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Sélection Ahma</span>
              <h2 className="section-title mt-3 text-3xl font-semibold text-ink-900 dark:text-white sm:text-4xl">
                Biens en vedette
              </h2>
              <p className="mt-3 max-w-lg text-sm text-ink-500 dark:text-ink-400">
                Une sélection de villas, appartements et terrains soigneusement choisis à Abidjan.
              </p>
            </div>
            <LinkButton href="/biens" variant="outline" size="sm">
              Voir tout le catalogue <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((b) => (
              <PropertyCard key={b.id} bien={b} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- POURQUOI AHMA ---------- */}
      <section id="apropos" className="container py-20 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Pourquoi Ahma</span>
            <h2 className="section-title mt-3 text-3xl font-semibold text-ink-900 dark:text-white sm:text-4xl">
              L&apos;exigence du détail, la confiance en plus
            </h2>
            <p className="mt-4 leading-relaxed text-ink-500 dark:text-ink-400">
              Notre équipe locale connaît parfaitement le marché abidjanais. Nous combinons
              expertise humaine et outils digitaux pour une gestion transparente et performante.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Suivi des paiements et détection automatique des impayés",
                "Quittances de loyer élégantes, générées en un clic",
                "Tableau de bord propriétaire avec indicateurs en temps réel",
                "Sélection rigoureuse des locataires et vérification d'identité",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/15">
                    <CheckCircle2 className="h-4 w-4 text-brand-500" />
                  </span>
                  <span className="text-sm leading-relaxed text-ink-700 dark:text-ink-200">{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <div className="text-xs font-semibold uppercase tracking-widest text-ink-400">Nos zones d&apos;intervention</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {quartiers.map((q) => (
                  <span key={q} className="rounded-full border border-surface bg-surface px-3 py-1.5 text-xs font-medium text-ink-600 shadow-sm dark:text-ink-300">
                    {q}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-soft-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/properties/villa-contemporaine.webp" alt="Villa contemporaine gérée par Ahma Immobilier" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-4 grid grid-cols-2 gap-3 sm:-left-8">
              {[
                { icon: Star, v: "24 h", l: "Délai de réponse" },
                { icon: ReceiptText, v: "1 clic", l: "Quittance PDF" },
              ].map((c) => (
                <div key={c.l} className="card min-w-[130px] p-4 sm:p-5">
                  <c.icon className="h-5 w-5 text-gold-500" />
                  <div className="mt-2 font-display text-lg font-bold text-ink-900 dark:text-white">{c.v}</div>
                  <div className="text-[11px] text-ink-500 dark:text-ink-400">{c.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PARCOURS CLIENT ---------- */}
      <section className="border-y border-surface bg-surface py-20 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Notre méthode</span>
            <h2 className="section-title mt-4 text-3xl font-semibold text-ink-900 dark:text-white sm:text-4xl">
              Un parcours clair, du premier clic à la remise des clés
            </h2>
          </div>
          <div className="relative mt-12 grid gap-6 md:grid-cols-3">
            <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent md:block dark:via-brand-500/30" />
            {[
              { n: "01", t: "Explorez", d: "Filtrez nos biens, comparez-les et enregistrez vos critères pour être alerté des nouveautés.", icon: Search },
              { n: "02", t: "Visitez", d: "Échangez avec un gestionnaire dédié et organisez une visite accompagnée du bien retenu.", icon: MapPin },
              { n: "03", t: "Suivez", d: "Contrat, quittances et paiements : tout est accessible en temps réel depuis votre espace client.", icon: ShieldCheck },
            ].map((s) => (
              <div key={s.n} className="card card-interactive relative p-6 text-center">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-surface bg-surface text-brand-600 shadow-soft dark:text-brand-300">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="mt-4 block text-[11px] font-bold tracking-[0.2em] text-gold-600">{s.n}</span>
                <h3 className="font-editorial mt-1 text-xl font-semibold text-ink-900 dark:text-white">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TÉMOIGNAGE ---------- */}
      <section className="bg-surface-2 py-20 sm:py-24">
        <div className="container max-w-3xl text-center">
          <Quote className="mx-auto h-10 w-10 text-gold-500" />
          <div className="mt-5 flex justify-center gap-1" aria-label="Note 5 sur 5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
            ))}
          </div>
          <p className="mt-6 font-display text-xl font-medium leading-relaxed text-ink-800 dark:text-ink-100 sm:text-2xl">
            « Depuis qu&apos;Ahma gère mes appartements au Plateau, je n&apos;ai plus aucun souci :
            loyers encaissés à temps, quittances impeccables et un suivi vraiment professionnel. »
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient font-bold text-white">KA</div>
            <div className="text-left">
              <div className="font-semibold text-ink-900 dark:text-white">Koffi Anderson</div>
              <div className="text-sm text-ink-500 dark:text-ink-400">Propriétaire, Le Plateau</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- OUTILS & SERVICES EN LIGNE ---------- */}
      <section className="container py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600">Nos outils en ligne</span>
          <h2 className="section-title mt-3 text-3xl font-semibold text-ink-900 dark:text-white sm:text-4xl">
            Tout pour décider en toute confiance
          </h2>
          <p className="mt-4 text-ink-500 dark:text-ink-400">
            Simulez, estimez, comparez et suivez votre patrimoine depuis votre navigateur — sans engagement.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Calculator, title: "Simulateur de financement", text: "Mensualités et capacité d'emprunt en quelques clics.", href: "/simulateur", tint: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300" },
            { icon: Sparkles, title: "Estimer mon bien", text: "Loyer ou prix de vente indicatif basé sur le marché.", href: "/estimer", tint: "bg-gold-50 text-gold-600 dark:bg-gold-500/15 dark:text-gold-300" },
            { icon: MapIcon, title: "Carte des biens", text: "Explorez nos biens quartier par quartier à Abidjan.", href: "/carte", tint: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300" },
            { icon: GitCompareArrows, title: "Comparateur", text: "Mettez jusqu'à 4 biens côte à côte avant de choisir.", href: "/comparer", tint: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300" },
            { icon: UserRound, title: "Espaces clients", text: "Locataires et propriétaires : suivi en temps réel.", href: "/connexion-locataire", tint: "bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300" },
            { icon: Wrench, title: "Signaler un problème", text: "Un incident ? Notre équipe technique prend le relais.", href: "/signalement", tint: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" },
          ].map((t) => (
            <Link key={t.href} href={t.href} className="card group flex items-start gap-4 p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft-lg">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.tint}`}>
                <t.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display font-bold text-ink-900 dark:text-white">{t.title}</h3>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{t.text}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition group-hover:translate-x-0.5">
                  Découvrir <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- CTA / CONTACT ---------- */}
      <section id="contact" className="container py-20 sm:py-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-gradient px-6 py-16 text-center text-white sm:px-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-gold-500/10 blur-3xl" />
          <h2 className="section-title relative text-3xl font-semibold sm:text-4xl">
            Confiez-nous la gestion de vos biens
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/75">
            Nous étudions votre patrimoine et vous proposons un plan de gestion sur mesure, sans engagement.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/contact" variant="gold" size="lg">Prendre contact</LinkButton>
            <a href="tel:+2250712275713" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/25 bg-white/5 text-white hover:bg-white/15")}>
              <Phone className="h-4 w-4" /> +225 07 12 27 57 13
            </a>
          </div>
          <a href="mailto:contact@ahma-immobilier.ci" className="relative mt-5 inline-block text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
            contact@ahma-immobilier.ci
          </a>
        </div>
      </section>
    </>
  );
}
