import Link from "next/link";
import { Building2, Plus, MapPin, Eye, Pencil } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { PropertyImage } from "@/components/ui/property-image";
import { StatutBien } from "@/components/ui/status-badge";
import {
  BIEN_TYPE_LABEL,
  formatFCFA,
  formatNumber,
  parseArray,
  cn,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

const CHIPS = [
  { key: "disponible", label: "Disponibles", cls: "text-brand-600" },
  { key: "loue", label: "Loués", cls: "text-sky-600" },
  { key: "reserve", label: "Réservés", cls: "text-gold-600" },
  { key: "maintenance", label: "Maintenance", cls: "text-rose-600" },
];

export default async function BiensPage() {
  const biens = await prisma.bien.findMany({
    orderBy: { createdAt: "desc" },
    include: { proprietaire: true },
  });

  const count = (s: string) => biens.filter((b) => b.statut === s).length;

  return (
    <>
      <PageHeader title="Biens" subtitle={`${biens.length} bien(s) au catalogue`}>
        <LinkButton href="/admin/biens/nouveau" variant="primary" size="sm">
          <Plus className="h-4 w-4" /> Nouveau bien
        </LinkButton>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {CHIPS.map((c) => (
          <span key={c.key} className="inline-flex items-center gap-1.5 rounded-full border border-surface bg-surface px-3 py-1.5 text-xs font-semibold">
            <span className={cn("h-1.5 w-1.5 rounded-full bg-current", c.cls)} />
            <span className="text-ink-600 dark:text-ink-300">{c.label}</span>
            <span className="text-ink-400">{count(c.key)}</span>
          </span>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-surface text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Bien</th>
                <th className="px-5 py-3 font-semibold">Quartier</th>
                <th className="px-5 py-3 font-semibold">Loyer / Prix</th>
                <th className="px-5 py-3 font-semibold">Surface</th>
                <th className="px-5 py-3 font-semibold">Propriétaire</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {biens.map((b) => (
                <tr key={b.id} className="group transition hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg">
                        <PropertyImage accent={b.accent} type={b.type} variant={b.id} rounded={false} className="h-full w-full" src={parseArray(b.photos)[0]} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink-900 dark:text-white">{b.titre}</div>
                        <div className="text-xs text-ink-400">{BIEN_TYPE_LABEL[b.type] ?? b.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-600 dark:text-ink-300">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-ink-400" />{b.quartier}</span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-ink-800 dark:text-ink-100">
                    {b.loyer ? `${formatFCFA(b.loyer)}` : b.prixVente ? formatFCFA(b.prixVente) : "—"}
                    {b.loyer && <span className="block text-xs font-normal text-ink-400">/mois</span>}
                  </td>
                  <td className="px-5 py-3 text-ink-600 dark:text-ink-300">{formatNumber(b.superficie)} m²</td>
                  <td className="px-5 py-3 text-ink-600 dark:text-ink-300">
                    {b.proprietaire ? `${b.proprietaire.nom}${b.proprietaire.prenom ? " " + b.proprietaire.prenom : ""}` : "—"}
                  </td>
                  <td className="px-5 py-3"><StatutBien statut={b.statut} /></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/biens/${b.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-brand-700">
                        <Eye className="h-4 w-4" /> Voir
                      </Link>
                      <Link href={`/admin/biens/${b.id}/modifier`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
                        <Pencil className="h-4 w-4" /> Modifier
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {biens.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-ink-400">
                  <Building2 className="mx-auto mb-3 h-10 w-10 text-ink-300" />Aucun bien enregistré.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
