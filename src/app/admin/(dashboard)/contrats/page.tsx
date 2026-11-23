import Link from "next/link";
import { Plus, CalendarRange } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { StatutContrat } from "@/components/ui/status-badge";
import { formatFCFA, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CHIPS: [string, string][] = [
  ["actif", "Actifs"],
  ["a_venir", "À venir"],
  ["expire", "Expirés"],
  ["resilie", "Résiliés"],
];

export default async function ContratsPage() {
  const contrats = await prisma.contrat.findMany({
    include: { bien: true, locataire: true },
    orderBy: { dateDebut: "desc" },
  });
  const count = (s: string) => contrats.filter((c) => c.statut === s).length;

  return (
    <>
      <PageHeader title="Contrats de bail" subtitle={`${contrats.length} contrat(s)`}>
        <LinkButton href="/admin/contrats/nouveau" variant="primary" size="sm"><Plus className="h-4 w-4" /> Nouveau contrat</LinkButton>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {CHIPS.map(([k, l]) => (
          <span key={k} className="inline-flex items-center gap-1.5 rounded-full border border-surface bg-surface px-3 py-1.5 text-xs font-semibold text-ink-600 dark:text-ink-300">
            {l} <span className="text-ink-400">{count(k)}</span>
          </span>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-surface text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Bien</th>
                <th className="px-5 py-3 font-semibold">Locataire</th>
                <th className="px-5 py-3 font-semibold">Période</th>
                <th className="px-5 py-3 font-semibold">Loyer mensuel</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {contrats.map((c) => (
                <tr key={c.id} className="hover:bg-surface-2">
                  <td className="px-5 py-3"><div className="font-semibold text-ink-900 dark:text-white">{c.bien.titre}</div><div className="text-xs text-ink-400">{c.bien.quartier}</div></td>
                  <td className="px-5 py-3 text-ink-700 dark:text-ink-200">{c.locataire.nom}{c.locataire.prenom ? " " + c.locataire.prenom : ""}</td>
                  <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{formatDate(c.dateDebut)} → {formatDate(c.dateFin)}</td>
                  <td className="px-5 py-3 font-semibold">{formatFCFA(c.loyerMensuel)}</td>
                  <td className="px-5 py-3"><StatutContrat statut={c.statut} /></td>
                  <td className="px-5 py-3 text-right"><Link href={`/admin/contrats/${c.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Ouvrir →</Link></td>
                </tr>
              ))}
              {contrats.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-ink-400"><CalendarRange className="mx-auto mb-3 h-10 w-10 text-ink-300" />Aucun contrat.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
