import Link from "next/link";
import { BellRing, Search, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { formatDate } from "@/lib/utils";
import { criteriaLabel, criteriaToQuery, parseCriteria } from "@/lib/search";

export const dynamic = "force-dynamic";

export default async function AdminAlertesPage() {
  const [recherches, alertes] = await Promise.all([
    prisma.rechercheSauvegardee.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { alertes: true } } },
    }),
    prisma.alerte.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { bien: { select: { titre: true } }, recherche: { select: { email: true } } },
    }),
  ]);

  const actives = recherches.filter((r) => r.actif).length;

  return (
    <>
      <PageHeader title="Alertes & recherches" subtitle={`${recherches.length} recherche(s) enregistrée(s), ${actives} active(s)`} />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Recherches", value: recherches.length },
          { label: "Actives", value: actives },
          { label: "Alertes générées", value: alertes.length },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{s.label}</p>
            <p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-surface px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Recherches sauvegardées</h2>
        </div>
        {recherches.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Search className="h-9 w-9 text-ink-300" />
            <p className="font-semibold text-ink-800 dark:text-ink-100">Aucune recherche pour le moment</p>
            <p className="max-w-md text-sm text-ink-400">Les recherches enregistrées depuis le catalogue apparaîtront ici.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {recherches.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{criteriaLabel(parseCriteria(r.criteres))}</p>
                  <p className="mt-0.5 text-xs text-ink-400">{r.email} · {formatDate(r.createdAt)} · {r._count.alertes} alerte(s) · {r.actif ? "active" : "désactivée"}</p>
                </div>
                <Link href={criteriaToQuery(parseCriteria(r.criteres))} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                  Résultats <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-surface px-6 py-4">
          <BellRing className="h-5 w-5 text-gold-600" />
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Dernières alertes envoyées</h2>
        </div>
        {alertes.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-ink-400">Aucune alerte générée.</p>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {alertes.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 px-6 py-3 text-sm">
                <span className="h-2 w-2 rounded-full bg-gold-500" />
                <Link href={`/biens/${a.bienId}`} className="font-semibold text-ink-800 hover:text-brand-600 dark:text-ink-100">
                  {a.bien.titre}
                </Link>
                <span className="text-xs text-ink-400">→ {a.recherche.email}</span>
                <span className="ml-auto text-xs text-ink-400">{formatDate(a.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
