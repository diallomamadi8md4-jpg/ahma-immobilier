import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, User, CalendarRange, Wallet, Download, Plus, FileSignature } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { StatutContrat, StatutPaiement } from "@/components/ui/status-badge";
import { PaiementPayeButton } from "@/components/admin/paiement-quick-action";
import { formatFCFA, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContratDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const contrat = await prisma.contrat.findUnique({
    where: { id },
    include: { bien: { include: { proprietaire: true } }, locataire: true },
  });
  if (!contrat) notFound();

  const paiements = await prisma.paiement.findMany({
    where: { contratId: id },
    orderBy: { datePaiement: "desc" },
    take: 20,
  });

  const infos = [
    { icon: CalendarRange, label: "Période", value: `${formatDate(contrat.dateDebut)} → ${formatDate(contrat.dateFin)}` },
    { icon: Wallet, label: "Loyer mensuel", value: formatFCFA(contrat.loyerMensuel) },
    contrat.caution ? { icon: Wallet, label: "Caution", value: formatFCFA(contrat.caution) } : null,
    { icon: FileSignature, label: "Fréquence", value: contrat.frequence },
  ].filter(Boolean) as { icon: typeof Wallet; label: string; value: string }[];

  return (
    <>
      <PageHeader title={`Contrat #${contrat.id}`} subtitle={`${contrat.bien.titre} · ${contrat.locataire.nom}`}>
        <StatutContrat statut={contrat.statut} />
        <LinkButton href="/admin/contrats" variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Retour</LinkButton>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-3 font-display font-bold text-ink-900 dark:text-white">Bien concerné</h3>
              <Link href={`/admin/biens/${contrat.bienId}`} className="block">
                <div className="font-semibold text-ink-800 dark:text-ink-100 hover:text-brand-600">{contrat.bien.titre}</div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-500 dark:text-ink-400"><MapPin className="h-4 w-4 text-brand-500" />{contrat.bien.quartier}</div>
              </Link>
              {contrat.bien.proprietaire && (
                <div className="mt-3 border-t border-surface pt-3 text-sm text-ink-500 dark:text-ink-400">
                  Propriétaire : <Link href={`/admin/proprietaires/${contrat.bien.proprietaire.id}`} className="font-semibold text-brand-600">{contrat.bien.proprietaire.nom}</Link>
                </div>
              )}
            </div>
            <div className="card p-5">
              <h3 className="mb-3 font-display font-bold text-ink-900 dark:text-white">Locataire</h3>
              <Link href={`/admin/locataires/${contrat.locataireId}`} className="block">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-500" />
                  <span className="font-semibold text-ink-800 dark:text-ink-100 hover:text-brand-600">{contrat.locataire.nom}{contrat.locataire.prenom ? " " + contrat.locataire.prenom : ""}</span>
                </div>
              </Link>
              <div className="mt-2 text-sm text-ink-500 dark:text-ink-400">{contrat.locataire.email ?? contrat.locataire.telephone ?? "—"}</div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-display font-bold text-ink-900 dark:text-white">Détails du bail</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {infos.map((i) => (
                <div key={i.label} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"><i.icon className="h-4 w-4" /></div>
                  <div><div className="text-xs text-ink-400">{i.label}</div><div className="text-sm font-semibold text-ink-800 dark:text-ink-100">{i.value}</div></div>
                </div>
              ))}
            </div>
            {contrat.notes && <p className="mt-4 rounded-xl bg-surface-2 p-3 text-sm text-ink-600 dark:text-ink-300">{contrat.notes}</p>}
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Échéances & paiements</h3>
              <LinkButton href={`/admin/paiements/nouveau?contratId=${contrat.id}`} variant="ghost" size="sm"><Plus className="h-4 w-4" /> Encaisser</LinkButton>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead><tr className="border-y border-surface text-left text-xs uppercase text-ink-400">
                  <th className="px-6 py-2 font-semibold">Référence</th>
                  <th className="px-6 py-2 font-semibold">Période</th>
                  <th className="px-6 py-2 font-semibold">Montant</th>
                  <th className="px-6 py-2 font-semibold">Statut</th>
                  <th className="px-6 py-2 text-right font-semibold">Action</th>
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
                          <a href={`/api/quittances/${p.id}`} download className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600"><Download className="h-4 w-4" /> Quittance</a>
                        ) : (
                          <PaiementPayeButton id={p.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                  {paiements.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-ink-400">Aucune échéance.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-display font-bold text-ink-900 dark:text-white">Synthèse</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink-500">Encaissé (payé)</span><span className="font-semibold text-brand-600">{formatFCFA(paiements.filter((p) => p.statut === "paye").reduce((s, p) => s + p.montant, 0))}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">En attente</span><span className="font-semibold text-gold-600">{formatFCFA(paiements.filter((p) => p.statut === "en_attente").reduce((s, p) => s + p.montant, 0))}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">En retard</span><span className="font-semibold text-rose-600">{formatFCFA(paiements.filter((p) => p.statut === "retard").reduce((s, p) => s + p.montant, 0))}</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
