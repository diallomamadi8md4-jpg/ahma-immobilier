import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Home, Wallet, ReceiptText, AlertTriangle, CalendarDays, Wrench,
  ArrowUpRight, Download, CheckCircle2, MessageCircle,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getPortailSession } from "@/lib/portail-session";
import { PortalHeader } from "@/components/public/portal-header";
import { PropertyImage } from "@/components/ui/property-image";
import {
  BIEN_TYPE_LABEL, CONTRAT_STATUT_META, PAIEMENT_STATUT_META,
  cn, formatDate, formatFCFA, formatNumber, monthLabel, parseArray,
} from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mon espace locataire" };

export default async function EspaceLocatairePage() {
  const session = await getPortailSession();
  if (!session) redirect("/connexion-locataire");

  const locataire = await prisma.locataire.findUnique({
    where: { id: session.id },
    include: {
      contrats: { include: { bien: true }, orderBy: { createdAt: "desc" } },
      paiements: { include: { bien: true, contrat: true }, orderBy: { datePaiement: "desc" } },
    },
  });
  if (!locataire) redirect("/connexion-locataire");

  const actif = locataire.contrats.find((c) => c.statut === "actif") ?? locataire.contrats[0];
  const impayes = locataire.paiements
    .filter((p) => p.statut === "retard" || p.statut === "en_attente")
    .reduce((sum, p) => sum + p.montant, 0);
  const quittances = locataire.paiements.filter((p) => p.statut === "paye").length;
  const now = new Date();
  const nextMonth = `${now.getFullYear()}-${String(now.getMonth() + 2 > 12 ? 1 : now.getMonth() + 2).padStart(2, "0")}`;

  const stats = [
    { icon: Home, label: "Mon logement", value: actif ? BIEN_TYPE_LABEL[actif.bien.type] ?? actif.bien.type : "—", sub: actif?.bien.quartier ?? "" },
    { icon: Wallet, label: "Loyer mensuel", value: actif ? formatFCFA(actif.loyerMensuel) : "—", sub: actif?.frequence === "mensuel" ? "Mensualité" : actif?.frequence ?? "" },
    { icon: CheckCircle2, label: "Quittances", value: String(quittances), sub: "paiements enregistrés" },
    { icon: impayes > 0 ? AlertTriangle : ReceiptText, label: "Impayés", value: formatFCFA(impayes), sub: impayes > 0 ? "À régulariser" : "Tout est à jour" },
  ];

  return (
    <>
      <PortalHeader
        eyebrow="Espace locataire"
        title={`Bonjour ${session.nom.split(" ")[0]} 👋`}
        subtitle="Retrouvez votre contrat, vos paiements et vos quittances en un coup d'œil."
      />

      <section className="container py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="card card-interactive p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-400">{s.label}</p>
              <p className="font-editorial mt-1 truncate text-2xl font-semibold text-ink-900 dark:text-white">{s.value}</p>
              <p className="mt-1 truncate text-xs text-ink-400">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Mon contrat de location</h2>
            {actif ? (
              <div className="mt-5">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl sm:w-48">
                    <PropertyImage accent={actif.bien.accent} type={actif.bien.type} src={parseArray(actif.bien.photos)[0]} className="h-full w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">{actif.bien.titre}</h3>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", CONTRAT_STATUT_META[actif.statut]?.cls)}>
                        {CONTRAT_STATUT_META[actif.statut]?.label ?? actif.statut}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{actif.bien.quartier} · {formatNumber(actif.bien.superficie)} m²</p>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div><dt className="text-xs text-ink-400">Début</dt><dd className="font-semibold text-ink-800 dark:text-ink-100">{formatDate(actif.dateDebut)}</dd></div>
                      <div><dt className="text-xs text-ink-400">Fin</dt><dd className="font-semibold text-ink-800 dark:text-ink-100">{formatDate(actif.dateFin)}</dd></div>
                      <div><dt className="text-xs text-ink-400">Loyer</dt><dd className="font-semibold text-ink-800 dark:text-ink-100">{formatFCFA(actif.loyerMensuel)}</dd></div>
                      <div><dt className="text-xs text-ink-400">Caution</dt><dd className="font-semibold text-ink-800 dark:text-ink-100">{formatFCFA(actif.caution)}</dd></div>
                    </dl>
                  </div>
                </div>
                <Link href={`/biens/${actif.bienId}`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
                  Voir la fiche du bien <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <p className="mt-5 text-sm text-ink-400">Aucun contrat associé à votre compte.</p>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-gold-600" />
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Prochaine échéance</h2>
            </div>
            <p className="mt-6 font-display text-3xl font-bold text-ink-900 dark:text-white">{monthLabel(nextMonth)}</p>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              Loyer de {actif ? formatFCFA(actif.loyerMensuel) : "—"} à régler avant la fin du mois.
            </p>
            <div className="mt-6 rounded-xl bg-surface-2 p-4 text-xs text-ink-500 dark:text-ink-400">
              Les paiements peuvent être effectués en espèces, par virement ou Mobile Money auprès de l&apos;agence.
            </div>
            <Link href="/contact" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline">
              Une question sur un paiement ? <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="card mt-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-surface px-6 py-4">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Historique des paiements</h2>
            <span className="text-xs text-ink-400">{locataire.paiements.length} opération(s)</span>
          </div>
          {locataire.paiements.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-ink-400">Aucun paiement enregistré.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-surface text-left text-xs uppercase tracking-wide text-ink-400">
                    <th className="px-6 py-3 font-semibold">Mois</th>
                    <th className="px-6 py-3 font-semibold">Bien</th>
                    <th className="px-6 py-3 font-semibold">Montant</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Statut</th>
                    <th className="px-6 py-3 text-right font-semibold">Quittance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {locataire.paiements.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-2">
                      <td className="px-6 py-3 font-medium text-ink-800 dark:text-ink-100">{monthLabel(p.moisConcerne)}</td>
                      <td className="px-6 py-3 text-ink-500 dark:text-ink-400">{p.bien.titre}</td>
                      <td className="px-6 py-3 font-semibold text-ink-800 dark:text-ink-100">{formatFCFA(p.montant)}</td>
                      <td className="px-6 py-3 text-ink-500 dark:text-ink-400">{formatDate(p.datePaiement)}</td>
                      <td className="px-6 py-3">
                        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", PAIEMENT_STATUT_META[p.statut]?.cls)}>
                          {PAIEMENT_STATUT_META[p.statut]?.label ?? p.statut}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        {p.statut === "paye" ? (
                          <a href={`/api/quittances/${p.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline">
                            <Download className="h-3.5 w-3.5" /> Télécharger
                          </a>
                        ) : (
                          <span className="text-xs text-ink-300">Indisponible</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/signalement" className="card card-interactive flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-50 text-gold-600 dark:bg-gold-500/15"><Wrench className="h-5 w-5" /></div>
            <div><p className="font-semibold text-ink-900 dark:text-white">Signaler un problème</p><p className="text-xs text-ink-500 dark:text-ink-400">Plomberie, électricité, sécurité…</p></div>
            <ArrowUpRight className="ml-auto h-4 w-4 text-ink-300" />
          </Link>
          <Link href="/contact" className="card card-interactive flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15"><ReceiptText className="h-5 w-5" /></div>
            <div><p className="font-semibold text-ink-900 dark:text-white">Contacter l&apos;agence</p><p className="text-xs text-ink-500 dark:text-ink-400">Une question ? Nous sommes à votre écoute.</p></div>
            <ArrowUpRight className="ml-auto h-4 w-4 text-ink-300" />
          </Link>
          <Link href="/espace-locataire/messagerie" className="card card-interactive flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/15"><MessageCircle className="h-5 w-5" /></div>
            <div><p className="font-semibold text-ink-900 dark:text-white">Messagerie</p><p className="text-xs text-ink-500 dark:text-ink-400">Échangez directement avec votre gestionnaire.</p></div>
            <ArrowUpRight className="ml-auto h-4 w-4 text-ink-300" />
          </Link>
        </div>
      </section>
    </>
  );
}
