import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, IdCard, Building2 } from "lucide-react";
import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { PropertyImage } from "@/components/ui/property-image";
import { StatutBien } from "@/components/ui/status-badge";
import { formatFCFA, formatDate, initials, BIEN_TYPE_LABEL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProprietaireDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const p = await prisma.proprietaire.findUnique({
    where: { id },
    include: { biens: { orderBy: { createdAt: "desc" } } },
  });
  if (!p) notFound();

  const infos = [
    { icon: Mail, label: "Email", value: p.email },
    { icon: Phone, label: "Téléphone", value: p.telephone },
    { icon: MapPin, label: "Adresse", value: p.adresse },
    { icon: IdCard, label: p.typePiece ?? "Pièce", value: p.numeroPiece },
  ].filter((i) => i.value);

  return (
    <>
      <PageHeader title={`${p.nom}${p.prenom ? " " + p.prenom : ""}`} subtitle={p.societe ?? (p.typePersonne === "morale" ? "Personne morale" : "Personne physique")}>
        <LinkButton href="/admin/proprietaires" variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Retour</LinkButton>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Biens ({p.biens.length})</h2>
              <LinkButton href={`/admin/biens/nouveau?proprietaireId=${p.id}`} variant="ghost" size="sm"><Building2 className="h-4 w-4" /> Ajouter un bien</LinkButton>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {p.biens.map((b) => (
                <Link key={b.id} href={`/admin/biens/${b.id}`} className="flex items-center gap-3 px-6 py-3 transition hover:bg-surface-2">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <PropertyImage accent={b.accent} type={b.type} variant={b.id} rounded={false} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink-900 dark:text-white">{b.titre}</div>
                    <div className="text-xs text-ink-400">{BIEN_TYPE_LABEL[b.type] ?? b.type} · {b.quartier}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-ink-800 dark:text-ink-100">{b.loyer ? formatFCFA(b.loyer) : b.prixVente ? formatFCFA(b.prixVente) : "—"}</div>
                    <StatutBien statut={b.statut} />
                  </div>
                </Link>
              ))}
              {p.biens.length === 0 && <div className="px-6 py-10 text-center text-sm text-ink-400">Aucun bien rattaché.</div>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-gradient text-2xl font-bold text-white">{initials(p.nom, p.prenom)}</div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink-900 dark:text-white">{p.nom}{p.prenom ? " " + p.prenom : ""}</h3>
            <p className="text-sm text-ink-400">{p.societe ?? "Mandant"}</p>
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
              <div className="flex items-start gap-2.5">
                <IdCard className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <div><div className="text-xs text-ink-400">Mandant depuis</div><div className="text-ink-700 dark:text-ink-200">{formatDate(p.createdAt)}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
