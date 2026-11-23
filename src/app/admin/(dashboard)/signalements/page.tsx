import { Wrench, Phone, Mail, AlertTriangle } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { setSignalementStatutAction } from "@/actions";
import { formatDate, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUTS: Record<string, { label: string; cls: string }> = {
  ouvert: { label: "Ouvert", cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  en_cours: { label: "En cours", cls: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  resolu: { label: "Résolu", cls: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300" },
};

const URGENCES: Record<string, string> = {
  faible: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300",
  moyenne: "bg-gold-50 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300",
  urgente: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export default async function SignalementsPage() {
  const signalements = await prisma.signalement.findMany({
    orderBy: { createdAt: "desc" },
    include: { bien: { select: { titre: true, quartier: true } } },
  });

  return (
    <>
      <PageHeader title="Signalements" subtitle={`${signalements.length} signalement${signalements.length > 1 ? "s" : ""} enregistré${signalements.length > 1 ? "s" : ""}`} />

      {signalements.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-20 text-center">
          <Wrench className="h-10 w-10 text-ink-300" />
          <p className="font-semibold text-ink-800 dark:text-ink-100">Aucun signalement pour le moment</p>
          <p className="max-w-md text-sm text-ink-400">Les signalements envoyés depuis le site apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {signalements.map((s) => {
            const meta = STATUTS[s.statut] ?? STATUTS.ouvert;
            return (
              <div key={s.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${URGENCES[s.urgence] ?? URGENCES.moyenne}`}>
                        {s.urgence === "urgente" ? "Urgent" : s.urgence === "moyenne" ? "Moyen" : "Faible"}
                      </span>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", meta.cls)}>{meta.label}</span>
                      <span className="text-xs text-ink-400">S-{String(s.id).padStart(5, "0")}</span>
                    </div>
                    <h2 className="mt-2 font-display text-lg font-bold text-ink-900 dark:text-white">{s.type}</h2>
                    <p className="mt-1 text-xs text-ink-400">{s.bien?.titre ?? "Bien supprimé"} · {s.bien?.quartier ?? "—"} · {formatDate(s.createdAt)}</p>
                  </div>
                  <form action={setSignalementStatutAction} className="flex items-center gap-2">
                    <input type="hidden" name="signalementId" value={s.id} />
                    <select name="statut" defaultValue={s.statut} className="input-base w-auto py-1.5 text-xs" aria-label="Statut du signalement">
                      {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">Enregistrer</button>
                  </form>
                </div>
                <p className="mt-4 whitespace-pre-line rounded-xl bg-surface-2 p-4 text-sm text-ink-600 dark:text-ink-300">{s.description}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink-500 dark:text-ink-400">
                  <span className="flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" /> {s.nom}</span>
                  <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {s.telephone}</span>
                  {s.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {s.email}</span>}
                  {s.urgence === "urgente" && <span className="flex items-center gap-1.5 font-semibold text-rose-600"><AlertTriangle className="h-3.5 w-3.5" /> Traitement prioritaire</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
