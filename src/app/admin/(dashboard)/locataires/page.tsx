import Link from "next/link";
import { Plus, Mail, Phone, Users, Briefcase, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { formatFCFA, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LocatairesPage() {
  const [locataires, impayes] = await Promise.all([
    prisma.locataire.findMany({
      include: { contrats: { where: { statut: "actif" } } },
      orderBy: { nom: "asc" },
    }),
    prisma.paiement.findMany({ where: { statut: { in: ["en_attente", "retard"] } } }),
  ]);

  const soldeMap = new Map<number, number>();
  for (const p of impayes) soldeMap.set(p.locataireId, (soldeMap.get(p.locataireId) ?? 0) + p.montant);

  return (
    <>
      <PageHeader title="Locataires" subtitle={`${locataires.length} locataire(s) géré(s)`}>
        <LinkButton href="/admin/locataires/nouveau" variant="primary" size="sm"><Plus className="h-4 w-4" /> Nouveau locataire</LinkButton>
      </PageHeader>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-surface text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Locataire</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Profession</th>
                <th className="px-5 py-3 font-semibold">Baux actifs</th>
                <th className="px-5 py-3 font-semibold">Solde dû</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {locataires.map((l) => {
                const solde = soldeMap.get(l.id) ?? 0;
                return (
                  <tr key={l.id} className="group transition hover:bg-surface-2">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">{initials(l.nom, l.prenom)}</div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-ink-900 dark:text-white">{l.nom}{l.prenom ? " " + l.prenom : ""}</div>
                          <div className="text-xs text-ink-400">#{l.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-600 dark:text-ink-300">
                      <div className="flex flex-col gap-0.5">
                        {l.email && <span className="flex items-center gap-1 text-xs"><Mail className="h-3 w-3" />{l.email}</span>}
                        {l.telephone && <span className="flex items-center gap-1 text-xs"><Phone className="h-3 w-3" />{l.telephone}</span>}
                        {!l.email && !l.telephone && <span className="text-xs text-ink-300">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-600 dark:text-ink-300">
                      <span className="inline-flex items-center gap-1 text-xs"><Briefcase className="h-3.5 w-3.5" />{l.profession ?? "—"}</span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-ink-800 dark:text-ink-100">{l.contrats.length}</td>
                    <td className="px-5 py-3">
                      {solde > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400"><AlertCircle className="h-3.5 w-3.5" />{formatFCFA(solde)}</span>
                      ) : (
                        <span className="text-xs font-medium text-brand-600">À jour</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/admin/locataires/${l.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Voir →</Link>
                    </td>
                  </tr>
                );
              })}
              {locataires.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-ink-400"><Users className="mx-auto mb-3 h-10 w-10 text-ink-300" />Aucun locataire.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
