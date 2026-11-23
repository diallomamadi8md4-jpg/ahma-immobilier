import Link from "next/link";
import { GalleryLightbox } from "@/components/public/gallery-lightbox";
import { notFound } from "next/navigation";
import {
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
  Building,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  CalendarDays,
  Wallet,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { PropertyGallery } from "@/components/ui/property-image";
import { VisiteForm } from "@/components/public/visite-form";
import { ShareBar } from "@/components/public/share-bar";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import {
  BIEN_STATUT_META,
  BIEN_TYPE_LABEL,
  formatFCFA,
  formatNumber,
  parseArray,
} from "@/lib/utils";

export const revalidate = 0;

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = parseId(params.id);
  const bien = id ? await prisma.bien.findUnique({ where: { id } }) : null;
  if (!bien) return { title: "Bien introuvable — Ahma Immobilier" };
  const prix = bien.loyer
    ? `${formatFCFA(bien.loyer)} / mois`
    : bien.prixVente
    ? `${formatFCFA(bien.prixVente)}`
    : "Sur devis";
  return {
    title: `${bien.titre} — ${bien.quartier} — Ahma Immobilier`,
    description: `${bien.titre} à ${bien.quartier} · ${bien.superficie} m² · ${prix}. ${bien.description?.slice(0, 150) ?? ""}`,
    openGraph: {
      title: `${bien.titre} — Ahma Immobilier`,
      description: `${bien.quartier} · ${bien.superficie} m² · ${prix}`,
      images: parseArray(bien.photos)[0] ? [{ url: parseArray(bien.photos)[0] }] : undefined,
    },
  };
}

export default async function BienDetailPage({ params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (!id) notFound();

  const bien = await prisma.bien.findUnique({
    where: { id },
    include: { proprietaire: true },
  });
  if (!bien) notFound();

  const equipements = parseArray(bien.equipements);
  const meta = BIEN_STATUT_META[bien.statut] ?? BIEN_STATUT_META.disponible;
  const louable = bien.statut === "disponible";
  const price = bien.loyer
    ? { label: `${formatFCFA(bien.loyer)}`, sub: "par mois" }
    : bien.prixVente
    ? { label: formatFCFA(bien.prixVente), sub: "à vendre" }
    : { label: "Sur devis", sub: "" };

  const specs = [
    { icon: Maximize2, label: "Superficie", value: `${formatNumber(bien.superficie)} m²` },
    bien.nbChambres ? { icon: BedDouble, label: "Chambres", value: String(bien.nbChambres) } : null,
    bien.nbSallesDeBain ? { icon: Bath, label: "Salles de bain", value: String(bien.nbSallesDeBain) } : null,
    bien.etage ? { icon: Building, label: "Étage", value: String(bien.etage) } : null,
  ].filter(Boolean) as { icon: typeof Maximize2; label: string; value: string }[];

  return (
    <>
      <section className="border-b border-surface bg-surface-2">
        <div className="container py-6">
          <nav className="text-xs text-ink-400">
            <Link href="/" className="hover:text-brand-600">Accueil</Link>
            <span className="mx-1">/</span>
            <Link href="/biens" className="hover:text-brand-600">Nos biens</Link>
            <span className="mx-1">/</span>
            <span className="text-ink-600 dark:text-ink-300">{bien.titre}</span>
          </nav>
        </div>
      </section>

      <section className="container py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            <GalleryLightbox accent={bien.accent} type={bien.type} titre={bien.titre} photos={parseArray(bien.photos)} />

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge className="bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                {BIEN_TYPE_LABEL[bien.type] ?? bien.type}
              </Badge>
              <Badge className={meta.cls} dot dotClass={meta.dot}>{meta.label}</Badge>
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold text-ink-900 dark:text-white">{bien.titre}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-ink-500 dark:text-ink-400">
              <MapPin className="h-4 w-4 text-brand-500" /> {bien.quartier}
              {bien.adresse ? ` — ${bien.adresse}` : ""}
            </p>

            <div className="mt-4"><ShareBar titre={bien.titre} /></div>

            {/* Caractéristiques */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {specs.map((s) => (
                <div key={s.label} className="card-tight flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-ink-400">{s.label}</div>
                    <div className="font-semibold text-ink-800 dark:text-ink-100">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="card mt-6 p-6">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Description</h2>
              <p className="mt-3 leading-relaxed text-ink-600 dark:text-ink-300">
                {bien.description ?? "Aucune description fournie."}
              </p>
            </div>

            {/* Équipements */}
            {equipements.length > 0 && (
              <div className="card mt-6 p-6">
                <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Équipements & atouts</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {equipements.map((eq) => (
                    <div key={eq} className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
                      <CheckCircle2 className="h-4 w-4 text-brand-500" /> {eq}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <div className="card overflow-hidden">
                <div className="bg-brand-gradient p-6 text-white">
                  <div className="text-sm text-white/70">{price.sub}</div>
                  <div className="font-display text-3xl font-bold">{price.label}</div>
                  {bien.loyer && bien.caution ? (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-white/80">
                      <Wallet className="h-4 w-4" /> Caution : {formatFCFA(bien.caution)}
                    </div>
                  ) : null}
                </div>
                <div className="p-6">
                  {louable ? (
                    <VisiteForm bienId={bien.id} bienTitre={bien.titre} />
                  ) : (
                    <div className="card-tight border-0 bg-ink-50 p-5 text-center dark:bg-ink-800/40">
                      <CalendarDays className="mx-auto h-8 w-8 text-ink-400" />
                      <p className="mt-2 font-semibold text-ink-700 dark:text-ink-200">
                        {bien.statut === "loue"
                          ? "Ce bien est actuellement loué"
                          : bien.statut === "reserve"
                          ? "Ce bien est actuellement réservé"
                          : "Bien non disponible à la visite"}
                      </p>
                      <p className="mt-1 text-sm text-ink-400">
                        Contactez-nous pour être informé des prochaines disponibilités.
                      </p>
                      <a
                        href={`mailto:contact@ahma-immobilier.ci?subject=Disponibilité - ${encodeURIComponent(bien.titre)}`}
                        className="mt-4 block"
                      >
                        <Button variant="outline" size="sm" className="w-full">Nous contacter</Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="card p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
                  <ShieldCheck className="h-5 w-5 text-brand-500" /> Géré par Ahma Immobilier
                </div>
                <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
                  Visite accompagnée, vérification d&apos;identité et contrat de bail sécurisé.
                </p>
              </div>

              <LinkButton href="/biens" variant="ghost" className="w-full">
                <ArrowLeft className="h-4 w-4" /> Retour au catalogue
              </LinkButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
