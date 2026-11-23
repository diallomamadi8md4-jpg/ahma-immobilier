import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, IdCard, Download, Plus, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { StatutPaiement } from "@/components/ui/status-badge";
import { formatFCFA, formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LocataireDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const locataire = await prisma.locataire.findUnique({
    where: { id },
    include: { contrats: { include: { bien: true }, orderBy: { dateDebut: "desc" } } },
  });
  if (!locataire) notFound();

  const paiements = await prisma.paiement.findMany({
    where: { locataireId: id },
    orderBy: { datePaiement: "desc" },
    take: 12,
  });
  const solde = paiements.filter((p) => p.statut !== "paye").reduce((s, p) => s + p.montant, 0);

  const infos = [
    { icon: Mail, label: "Email", value: locataire.email },
    { icon: Phone, label: "Téléphone", value: locataire.telephone },
    { icon: MapPin, label: "Adresse", value: locataire.adresse },
    { icon: Briefcase, label: "Profession", value: locataire.profession },
    { icon: IdCard, label: `${locataire.typePiece ?? "Pièce"}`, value: locataire.numeroPiece },
  ].filter((i) => i.value);

  return (
    <>
      <PageHeader title={`${locataire.nom}${locataire.prenom ? " " + locataire.prenom : ""}`} subtitle={`Locataire #${locataire.id}`}>
        <LinkButton href="/admin/locataires" variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Retour</LinkButton>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Contrats & historique de location</h2>
            <div className="mt-4 space-y-3">
              {locataire.contrats.map((c) => (
                <Link key={c.id} href={`/admin/contrats/${c.id}`} className="flex items-center gap-3 rounded-xl border border-surface p-3 transition hover:bg-surface-2">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-brand-50 dark:bg-brand-500/15" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink-800 dark:text-ink-100">{c.bien.titre}</div>
                    <div className="text-xs text-ink-400">{formatDate(c.dateDebut)} → {formatDate(c.dateFin)}</div>
                  </div>
                  <span className="text-sm font-semibold text-ink-700 dark:text-ink-200">{formatFCFA(c.loyerMensuel)}/mois</span>
                </Link>
              ))}
              {locataire.contrats.length === 0 && <p className="text-sm text-ink-400">Aucun contrat.</p>}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Paiements récents</h2>
              <LinkButton href={`/admin/paiements/nouveau?contratId=${locataire.contrats[0]?.id ?? ""}`} variant="ghost" size="sm"><Plus className="h-4 w-4" /> Encaisser</LinkButton>
            </div>
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
                          <a href={`/api/quittances/${p.id}`} download className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600"><Download className="h-4 w-4" /> PDF</a>
                        ) : <span className="text-xs text-ink-300">—</span>}
                      </td>
                    </tr>
                  ))}
                  {paiements.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-400">Aucun paiement.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-gradient text-2xl font-bold text-white">{initials(locataire.nom, locataire.prenom)}</div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink-900 dark:text-white">{locataire.nom}{locataire.prenom ? " " + locataire.prenom : ""}</h3>
            <p className="text-sm text-ink-400">Locataire depuis {formatDate(locataire.createdAt)}</p>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-display font-bold text-ink-900 dark:text-white">Coordonnées</h3>
            <div className="space-y-2.5 text-sm">
              {infos.map((i) => (
                <div key={i.label} className="flex items-start gap-2.5">
                  <i.icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  <div>
                    <div className="text-xs text-ink-400">{i.label}</div>
                    <div className="text-ink-700 dark:text-ink-200">{i.value}</div>
                  </div>
                </div>
              ))}
              {infos.length === 0 && <p className="text-sm text-ink-400">Aucune coordonnée renseignée.</p>}
            </div>
          </div>

          <div className={`card p-5 ${solde > 0 ? "border-rose-200 dark:border-rose-500/30" : ""}`}>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-700 dark:text-ink-200">
              <AlertCircle className="h-4 w-4 text-rose-500" /> Solde dû
            </div>
            <div className={`mt-1 font-display text-2xl font-bold ${solde > 0 ? "text-rose-600 dark:text-rose-400" : "text-brand-600"}`}>
              {formatFCFA(solde)}
            </div>
            <p className="mt-1 text-xs text-ink-400">{solde > 0 ? "Loyers en attente / en retard" : "Tous les loyers sont réglés"}</p>
          </div>
        </div>
      </div>
    </>
  );
}
