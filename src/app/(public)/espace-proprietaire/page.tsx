import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2, KeyRound, Wallet, AlertTriangle, ArrowUpRight,
  ReceiptText, Sparkles, MapPin, MessageCircle,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getPortailSession } from "@/lib/portail-session";
import { PortalHeader } from "@/components/public/portal-header";
import { PropertyImage } from "@/components/ui/property-image";
import {
  BIEN_STATUT_META, BIEN_TYPE_LABEL, PAIEMENT_STATUT_META,
  cn, formatDate, formatFCFA, formatNumber, monthLabel, parseArray,
} from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon espace propriétaire" };

export default async function EspaceProprietairePage() {
  const session = await getPortailSession();
  if (!session) redirect("/connexion-proprietaire");

  const proprietaire = await prisma.proprietaire.findUnique({
    where: { id: session.id },
    include: {
      biens: {
        orderBy: { createdAt: "desc" },
        include: {
          contrats: { include: { locataire: true }, orderBy: { createdAt: "desc" } },
          paiements: { orderBy: { datePaiement: "desc" } },
        },
      },
    },
  });
  if (!proprietaire) redirect("/connexion-proprietaire");

  const biens = proprietaire.biens;
  const loues = biens.filter((b) => b.statut === "loue" || b.contrats.some((c) => c.statut === "actif"));
  const revenuMensuel = loues.reduce((sum, b) => {
    const actif = b.contrats.find((c) => c.statut === "actif");
    return sum + (actif?.loyerMensuel ?? b.loyer ?? 0);
  }, 0);
  const paiements = biens.flatMap((b) => b.paiements.map((p) => ({ ...p, bienTitre: b.titre })));
  const impayes = paiements
    .filter((p) => p.statut === "retard" || p.statut === "en_attente")
    .reduce((sum, p) => sum + p.montant, 0);

  const stats = [
    { icon: Building2, label: "Biens gérés", value: String(biens.length), sub: "au catalogue" },
    { icon: KeyRound, label: "Biens loués", value: String(loues.length), sub: "contrats en cours" },
    { icon: Wallet, label: "Revenus mensuels", value: formatFCFA(revenuMensuel), sub: "loyers estimés" },
    { icon: impayes > 0 ? AlertTriangle : ReceiptText, label: "Impayés", value: formatFCFA(impayes), sub: impayes > 0 ? "à suivre" : "aucun" },
  ];

  return (
    <>
      <PortalHeader
        eyebrow="Espace propriétaire"
        title={`Bonjour ${session.nom.split(" ")[0]} 👋`}
        subtitle="Suivez vos biens, vos locataires et vos revenus en temps réel."
      />

      <section className="container py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card card-interactive p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-500/15 dark:text-gold-300">
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">{s.label}</p>
              <p className="font-editorial mt-1 truncate text-2xl font-semibold text-ink-900 dark:text-white">{s.value}</p>
              <p className="mt-1 truncate text-xs text-ink-400">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="card mt-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-surface px-6 py-4">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Mes biens</h2>
            <span className="text-xs text-ink-400">{biens.length} bien(s)</span>
          </div>
          {biens.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-ink-400">Aucun bien n&apos;est associé à votre compte.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-surface text-left text-xs uppercase tracking-wide text-ink-400">
                    <th className="px-6 py-3 font-semibold">Bien</th>
                    <th className="px-6 py-3 font-semibold">Quartier</th>
                    <th className="px-6 py-3 font-semibold">Locataire</th>
                    <th className="px-6 py-3 font-semibold">Loyer</th>
                    <th className="px-6 py-3 font-semibold">Statut</th>
                    <th className="px-6 py-3 text-right font-semibold">Fiche</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {biens.map((b) => {
                    const actif = b.contrats.find((c) => c.statut === "actif");
                    const meta = BIEN_STATUT_META[b.statut] ?? BIEN_STATUT_META.disponible;
                    return (
                      <tr key={b.id} className="hover:bg-surface-2">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg">
                              <PropertyImage accent={b.accent} type={b.type} rounded={false} src={parseArray(b.photos)[0]} className="h-full w-full" />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-semibold text-ink-900 dark:text-white">{b.titre}</div>
                              <div className="text-xs text-ink-400">{BIEN_TYPE_LABEL[b.type] ?? b.type} · {formatNumber(b.superficie)} m²</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-ink-500 dark:text-ink-400"><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{b.quartier}</span></td>
                        <td className="px-6 py-3 text-ink-600 dark:text-ink-300">
                          {actif ? `${actif.locataire.prenom ?? ""} ${actif.locataire.nom}`.trim() : "—"}
                        </td>
                        <td className="px-6 py-3 font-semibold text-ink-800 dark:text-ink-100">{formatFCFA(actif?.loyerMensuel ?? b.loyer)}</td>
                        <td className="px-6 py-3"><span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", meta.cls)}>{meta.label}</span></td>
                        <td className="px-6 py-3 text-right">
                          <Link href={`/biens/${b.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                            Voir <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card mt-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-surface px-6 py-4">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Derniers paiements</h2>
            <span className="text-xs text-ink-400">{paiements.length} opération(s)</span>
          </div>
          {paiements.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-ink-400">Aucun paiement enregistré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-surface text-left text-xs uppercase tracking-wide text-ink-400">
                    <th className="px-6 py-3 font-semibold">Mois</th>
                    <th className="px-6 py-3 font-semibold">Bien</th>
                    <th className="px-6 py-3 font-semibold">Montant</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {paiements.slice(0, 10).map((p) => (
                    <tr key={p.id} className="hover:bg-surface-2">
                      <td className="px-6 py-3 font-medium text-ink-800 dark:text-ink-100">{monthLabel(p.moisConcerne)}</td>
                      <td className="px-6 py-3 text-ink-500 dark:text-ink-400">{p.bienTitre}</td>
                      <td className="px-6 py-3 font-semibold text-ink-800 dark:text-ink-100">{formatFCFA(p.montant)}</td>
                      <td className="px-6 py-3 text-ink-500 dark:text-ink-400">{formatDate(p.datePaiement)}</td>
                      <td className="px-6 py-3"><span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", PAIEMENT_STATUT_META[p.statut]?.cls)}>{PAIEMENT_STATUT_META[p.statut]?.label ?? p.statut}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/estimer" className="card card-interactive flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15"><Sparkles className="h-5 w-5" /></div>
            <div><p className="font-semibold text-ink-900 dark:text-white">Estimer mon bien</p><p className="text-xs text-ink-500 dark:text-ink-400">Loyer ou prix de vente indicatif</p></div>
            <ArrowUpRight className="ml-auto h-4 w-4 text-ink-300" />
          </Link>
          <Link href="/contact" className="card card-interactive flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-500/15"><ReceiptText className="h-5 w-5" /></div>
            <div><p className="font-semibold text-ink-900 dark:text-white">Contacter mon gestionnaire</p><p className="text-xs text-ink-500 dark:text-ink-400">Une question sur vos revenus ?</p></div>
            <ArrowUpRight className="ml-auto h-4 w-4 text-ink-300" />
          </Link>
          <Link href="/espace-proprietaire/messagerie" className="card card-interactive flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/15"><MessageCircle className="h-5 w-5" /></div>
            <div><p className="font-semibold text-ink-900 dark:text-white">Messagerie</p><p className="text-xs text-ink-500 dark:text-ink-400">Vos échanges avec l&apos;agence et vos locataires.</p></div>
            <ArrowUpRight className="ml-auto h-4 w-4 text-ink-300" />
          </Link>
        </div>
      </section>
    </>
  );
}
