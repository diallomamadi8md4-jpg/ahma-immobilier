import Link from "next/link";
import { Plus, Filter, ReceiptText, Download } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { buttonVariants } from "@/components/ui/button";
import { StatutPaiement } from "@/components/ui/status-badge";
import { PaiementPayeButton } from "@/components/admin/paiement-quick-action";
import { formatFCFA, formatDate, METHODE_LABEL, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaiementsPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const statutFilter = String(searchParams.statut ?? "");

  const all = await prisma.paiement.findMany({
    include: { bien: true, locataire: true },
    orderBy: { datePaiement: "desc" },
  });

  const total = (s: string) => all.filter((p) => p.statut === s).reduce((sum, p) => sum + p.montant, 0);
  const chips = [
    { key: "", label: "Tous", count: all.length, amount: all.reduce((s, p) => s + p.montant, 0), cls: "text-ink-600" },
    { key: "paye", label: "Payés", count: all.filter((p) => p.statut === "paye").length, amount: total("paye"), cls: "text-brand-600" },
    { key: "en_attente", label: "En attente", count: all.filter((p) => p.statut === "en_attente").length, amount: total("en_attente"), cls: "text-gold-600" },
    { key: "retard", label: "En retard", count: all.filter((p) => p.statut === "retard").length, amount: total("retard"), cls: "text-rose-600" },
  ];

  const paiements = statutFilter ? all.filter((p) => p.statut === statutFilter) : all;

  return (
    <>
      <PageHeader title="Paiements & Quittances" subtitle={`${all.length} échéance(s) · ${formatFCFA(all.reduce((s, p) => s + p.montant, 0))} au total`}>
        <a href="/api/paiements/export" download className={buttonVariants({ variant: "outline", size: "sm" })}><Download className="h-4 w-4" /> Exporter CSV</a>
        <LinkButton href="/admin/paiements/nouveau" variant="primary" size="sm"><Plus className="h-4 w-4" /> Encaisser un loyer</LinkButton>
      </PageHeader>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {chips.map((c) => (
          <Link
            key={c.key}
            href={c.key ? `/admin/paiements?statut=${c.key}` : "/admin/paiements"}
            className={cn(
              "card flex items-center justify-between p-4 transition hover:shadow-soft",
              statutFilter === c.key && "ring-2 ring-brand-500/40"
            )}
          >
            <div>
              <div className="text-xs font-medium text-ink-500 dark:text-ink-400">{c.label}</div>
              <div className={cn("mt-0.5 font-display text-xl font-bold", c.cls)}>{c.count}</div>
            </div>
            <div className="text-right text-xs text-ink-400">{formatFCFA(c.amount)}</div>
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-sm">
            <thead>
              <tr className="border-b border-surface text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Référence</th>
                <th className="px-5 py-3 font-semibold">Locataire</th>
                <th className="px-5 py-3 font-semibold">Bien</th>
                <th className="px-5 py-3 font-semibold">Mois</th>
                <th className="px-5 py-3 font-semibold">Montant</th>
                <th className="px-5 py-3 font-semibold">Moyen</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paiements.map((p) => (
                <tr key={p.id} className="hover:bg-surface-2">
                  <td className="px-5 py-3 font-mono text-xs text-ink-600 dark:text-ink-300">{p.reference ?? `#${p.id}`}</td>
                  <td className="px-5 py-3 font-medium text-ink-800 dark:text-ink-100">{p.locataire.nom}{p.locataire.prenom ? " " + p.locataire.prenom : ""}</td>
                  <td className="px-5 py-3 text-ink-600 dark:text-ink-300"><span className="line-clamp-1">{p.bien.titre}</span></td>
                  <td className="px-5 py-3 text-ink-500 dark:text-ink-400">{formatDate(p.datePaiement)}</td>
                  <td className="px-5 py-3 font-semibold">{formatFCFA(p.montant)}</td>
                  <td className="px-5 py-3 text-ink-600 dark:text-ink-300">{METHODE_LABEL[p.methode] ?? p.methode}</td>
                  <td className="px-5 py-3"><StatutPaiement statut={p.statut} /></td>
                  <td className="px-5 py-3 text-right">
                    {p.statut === "paye" ? (
                      <a href={`/api/quittances/${p.id}`} download className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"><Download className="h-4 w-4" /> Quittance</a>
                    ) : (
                      <PaiementPayeButton id={p.id} />
                    )}
                  </td>
                </tr>
              ))}
              {paiements.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-16 text-center text-ink-400"><ReceiptText className="mx-auto mb-3 h-10 w-10 text-ink-300" />Aucun paiement.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-ink-400">
        <Filter className="h-3.5 w-3.5" /> Cliquez sur une carte ci-dessus pour filtrer par statut.
      </div>
    </>
  );
}
