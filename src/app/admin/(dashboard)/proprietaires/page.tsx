import Link from "next/link";
import { Plus, Mail, Phone, Building2, UserSquare2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProprietairesPage() {
  const proprietaires = await prisma.proprietaire.findMany({
    include: { biens: true },
    orderBy: { nom: "asc" },
  });

  return (
    <>
      <PageHeader title="Propriétaires" subtitle={`${proprietaires.length} propriétaire(s)`}>
        <LinkButton href="/admin/proprietaires/nouveau" variant="primary" size="sm"><Plus className="h-4 w-4" /> Nouveau propriétaire</LinkButton>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {proprietaires.map((p) => (
          <Link key={p.id} href={`/admin/proprietaires/${p.id}`} className="card group p-5 transition hover:-translate-y-1 hover:shadow-soft-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white">{initials(p.nom, p.prenom)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-display font-bold text-ink-900 dark:text-white">{p.nom}{p.prenom ? " " + p.prenom : ""}</h3>
                </div>
                <Badge className={p.typePersonne === "morale" ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" : "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"}>
                  {p.typePersonne === "morale" ? "Personne morale" : "Personne physique"}
                </Badge>
              </div>
            </div>
            {p.societe && <p className="mt-3 text-xs font-medium text-ink-500">{p.societe}</p>}
            <div className="mt-3 space-y-1 text-xs text-ink-500 dark:text-ink-400">
              {p.email && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{p.email}</span>}
              {p.telephone && <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{p.telephone}</span>}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-surface pt-3 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-ink-700 dark:text-ink-200">
                <Building2 className="h-4 w-4 text-brand-500" /> {p.biens.length} bien(s)
              </span>
              <span className="text-xs font-semibold text-brand-600 group-hover:translate-x-0.5 transition">Voir →</span>
            </div>
          </Link>
        ))}
        {proprietaires.length === 0 && (
          <div className="card col-span-full flex flex-col items-center gap-3 py-16 text-center">
            <UserSquare2 className="h-10 w-10 text-ink-300" />
            <p className="text-ink-400">Aucun propriétaire enregistré.</p>
          </div>
        )}
      </div>
    </>
  );
}
