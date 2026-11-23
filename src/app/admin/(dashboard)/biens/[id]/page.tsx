import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Maximize2,
  BedDouble,
  Bath,
  Building,
  User,
  FileSignature,
  Download,
  Plus,
  Wallet,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { PropertyGallery } from "@/components/ui/property-image";
import { PhotoUploader } from "@/components/admin/photo-uploader";
import { BienStatutForm } from "@/components/admin/bien-statut-form";
import { StatutBien, StatutPaiement } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  BIEN_TYPE_LABEL,
  formatFCFA,
  formatNumber,
  formatDate,
  formatDateLong,
  parseArray,
  cn,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = parseId(params.id);
  const b = id ? await prisma.bien.findUnique({ where: { id } }) : null;
  return { title: b?.titre ?? "Bien" };
}

export default async function BienDetailAdmin({ params }: { params: { id: string } }) {
  const id = parseId(params.id);
  if (!id) notFound();
  const bien = await prisma.bien.findUnique({
    where: { id },
    include: { proprietaire: true },
  });
  if (!bien) notFound();

  const [contrats, paiements] = await Promise.all([
    prisma.contrat.findMany({
      where: { bienId: bien.id },
      include: { locataire: true },
      orderBy: { dateDebut: "desc" },
    }),
    prisma.paiement.findMany({
      where: { bienId: bien.id },
      orderBy: { datePaiement: "desc" },
      take: 8,
    }),
  ]);

  const equipements = parseArray(bien.equipements);
  const specs = [
    { icon: Maximize2, label: "Superficie", value: `${formatNumber(bien.superficie)} m²` },
    bien.nbChambres ? { icon: BedDouble, label: "Chambres", value: String(bien.nbChambres) } : null,
    bien.nbSallesDeBain ? { icon: Bath, label: "Salles de bain", value: String(bien.nbSallesDeBain) } : null,
    bien.etage ? { icon: Building, label: "Étage", value: String(bien.etage) } : null,
  ].filter(Boolean) as { icon: typeof Maximize2; label: string; value: string }[];

  return (
    <>
      <PageHeader title={bien.titre} subtitle={`${BIEN_TYPE_LABEL[bien.type] ?? bien.type} · ${bien.quartier}`}>
        <LinkButton href="/admin/biens" variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Retour</LinkButton>
        <LinkButton href={`/admin/contrats/nouveau?bienId=${bien.id}`} variant="primary" size="sm">
          <FileSignature className="h-4 w-4" /> Nouveau contrat
        </LinkButton>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PropertyGallery accent={bien.accent} type={bien.type} photos={parseArray(bien.photos)} />

          <PhotoUploader bienId={bien.id} photos={parseArray(bien.photos)} />

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Caractéristiques</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {specs.map((s) => (
                <div key={s.label} className="flex items-center gap-3 rounded-xl border border-surface p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs text-ink-400">{s.label}</div>
                    <div className="text-sm font-semibold text-ink-800 dark:text-ink-100">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400">
              <MapPin className="h-4 w-4 text-brand-500" /> {bien.quartier}{bien.adresse ? ` — ${bien.adresse}` : ""}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Description</h2>
            <p className="mt-3 leading-relaxed text-ink-600 dark:text-ink-300">{bien.description ?? "Aucune description."}</p>
            {equipements.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {equipements.map((eq) => (
                  <span key={eq} className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{eq}</span>
                ))}
              </div>
            )}
          </div>

          {/* Contrats liés */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Contrats de bail</h2>
              <LinkButton href={`/admin/contrats/nouveau?bienId=${bien.id}`} variant="ghost" size="sm"><Plus className="h-4 w-4" /> Ajouter</LinkButton>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead><tr className="border-y border-surface text-left text-xs uppercase text-ink-400">
                  <th className="px-6 py-2 font-semibold">Locataire</th>
                  <th className="px-6 py-2 font-semibold">Période</th>
                  <th className="px-6 py-2 font-semibold">Loyer</th>
                  <th className="px-6 py-2 font-semibold">Statut</th>
                  <th className="px-6 py-2 text-right font-semibold">Voir</th>
                </tr></thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {contrats.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-2">
                      <td className="px-6 py-3 font-medium text-ink-800 dark:text-ink-100">{c.locataire.nom}{c.locataire.prenom ? " " + c.locataire.prenom : ""}</td>
                      <td className="px-6 py-3 text-ink-500 dark:text-ink-400">{formatDate(c.dateDebut)} → {formatDate(c.dateFin)}</td>
                      <td className="px-6 py-3 font-semibold">{formatFCFA(c.loyerMensuel)}</td>
                      <td className="px-6 py-3"><StatutBien statut={c.statut === "actif" ? "loue" : c.statut === "a_venir" ? "reserve" : "disponible"} /></td>
                      <td className="px-6 py-3 text-right"><Link href={`/admin/contrats/${c.id}`} className="text-xs font-semibold text-brand-600">Ouvrir</Link></td>
                    </tr>
                  ))}
                  {contrats.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-400">Aucun contrat pour ce bien.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paiements récents */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4"><h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Paiements récents</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead><tr className="border-y border-surface text-left text-xs uppercase text-ink-400">
                  <th className="px-6 py-2 font-semibold">Référence</th>
                  <th className="px-6 py-2 font-semibold">Mois</th>
                  <th className="px-6 py-2 font-semibold">Montant</th>
                  <th className="px-6 py-2 font-semibold">Statut</th>
                  <th className="px-6 py-2 text-right font-semibold">Quittance</th>
                </tr></thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {paiements.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-2">
                      <td className="px-6 py-3 font-mono text-xs text-ink-600 dark:text-ink-300">{p.reference ?? `#${p.id}`}</td>
                      <td className="px-6 py-3 text-ink-500 dark:text-ink-400">{formatDate(p.datePaiement)}</td>
                      <td className="px-6 py-3 font-semibold">{formatFCFA(p.montant)}</td>
                      <td className="px-6 py-3"><StatutPaiement statut={p.statut} /></td>
                      <td className="px-6 py-3 text-right">
                        {p.statut === "paye" ? (
                          <a href={`/api/quittances/${p.id}`} download className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
                            <Download className="h-4 w-4" /> PDF
                          </a>
                        ) : <span className="text-xs text-ink-300">—</span>}
                      </td>
                    </tr>
                  ))}
                  {paiements.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-400">Aucun paiement enregistré.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="bg-brand-gradient p-5 text-white">
              <div className="text-xs text-white/70">{bien.loyer ? "Loyer mensuel" : "Prix de vente"}</div>
              <div className="font-display text-2xl font-bold">{bien.loyer ? formatFCFA(bien.loyer) : bien.prixVente ? formatFCFA(bien.prixVente) : "Sur devis"}</div>
              {bien.caution ? <div className="mt-1 flex items-center gap-1.5 text-sm text-white/80"><Wallet className="h-4 w-4" /> Caution : {formatFCFA(bien.caution)}</div> : null}
            </div>
            <div className="p-5">
              <label className="label-base">Statut du bien</label>
              <BienStatutForm bienId={bien.id} statut={bien.statut} />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-display font-bold text-ink-900 dark:text-white"><User className="h-4 w-4 text-brand-500" /> Propriétaire</h3>
            {bien.proprietaire ? (
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="font-semibold text-ink-800 dark:text-ink-100">{bien.proprietaire.nom}{bien.proprietaire.prenom ? " " + bien.proprietaire.prenom : ""}</div>
                {bien.proprietaire.email && <div className="text-ink-500 dark:text-ink-400">{bien.proprietaire.email}</div>}
                {bien.proprietaire.telephone && <div className="text-ink-500 dark:text-ink-400">{bien.proprietaire.telephone}</div>}
                <Link href={`/admin/proprietaires/${bien.proprietaire.id}`} className="inline-block text-xs font-semibold text-brand-600">Voir la fiche →</Link>
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-400">Aucun propriétaire rattaché.</p>
            )}
          </div>

          <LinkButton href={`/admin/paiements/nouveau?contratId=${contrats[0]?.id ?? ""}`} variant="outline" className="w-full">
            <Plus className="h-4 w-4" /> Encaisser un loyer
          </LinkButton>
        </div>
      </div>
    </>
  );
}
