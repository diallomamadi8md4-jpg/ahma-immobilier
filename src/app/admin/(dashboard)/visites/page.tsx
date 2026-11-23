import { CalendarCheck, Mail, Phone, MapPin } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { setVisiteStatutAction } from "@/actions";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUTS: Record<string, { label: string; cls: string }> = {
  nouvelle: { label: "Nouvelle", cls: "bg-gold-50 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300" },
  contactee: { label: "Contactée", cls: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  planifiee: { label: "Visite planifiée", cls: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" },
  annulee: { label: "Annulée", cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
};

export default async function VisitesPage() {
  const visites = await prisma.visite.findMany({
    orderBy: { createdAt: "desc" },
    include: { bien: { select: { titre: true, quartier: true } } },
  });

  return (
    <>
      <PageHeader
        title="Demandes de visite"
        subtitle={`${visites.length} demande${visites.length > 1 ? "s" : ""} enregistrée${visites.length > 1 ? "s" : ""}`}
      />

      {visites.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-20 text-center">
          <CalendarCheck className="h-10 w-10 text-ink-300" />
          <p className="font-semibold text-ink-800 dark:text-ink-100">Aucune demande de visite pour le moment</p>
          <p className="max-w-md text-sm text-ink-400">
            Les demandes envoyées depuis les fiches biens apparaîtront ici avec les coordonnées du prospect.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-surface text-left text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-5 py-3 font-semibold">Prospect</th>
                  <th className="px-5 py-3 font-semibold">Bien</th>
                  <th className="px-5 py-3 font-semibold">Date souhaitée</th>
                  <th className="px-5 py-3 font-semibold">Reçue le</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {visites.map((v) => {
                  const meta = STATUTS[v.statut] ?? STATUTS.nouvelle;
                  return (
                    <tr key={v.id} className="transition hover:bg-surface-2">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink-900 dark:text-white">{v.nom}</div>
                        <div className="mt-1 flex flex-col gap-1 text-xs text-ink-500 dark:text-ink-400">
                          <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {v.telephone}</span>
                          {v.email && <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {v.email}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="max-w-[220px] truncate font-medium text-ink-800 dark:text-ink-100">{v.bien.titre}</div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-ink-400"><MapPin className="h-3 w-3" /> {v.bien.quartier}</div>
                      </td>
                      <td className="px-5 py-4 text-ink-600 dark:text-ink-300">{v.dateSouhaitee ? formatDate(v.dateSouhaitee) : "—"}</td>
                      <td className="px-5 py-4 text-ink-500 dark:text-ink-400">{formatDate(v.createdAt)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${meta.cls}`}>{meta.label}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <form action={setVisiteStatutAction} className="flex justify-end gap-2">
                          <input type="hidden" name="visiteId" value={v.id} />
                          <select name="statut" defaultValue={v.statut} className="input-base w-auto py-1.5 text-xs" aria-label="Statut de la demande">
                            {Object.entries(STATUTS).map(([key, m]) => (
                              <option key={key} value={key}>{m.label}</option>
                            ))}
                          </select>
                          <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                            Enregistrer
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
