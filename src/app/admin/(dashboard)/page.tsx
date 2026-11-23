import Link from "next/link";
import {
  Building2,
  Wallet,
  Clock,
  AlertTriangle,
  CalendarClock,
  Wrench,
  FileX2,
  ArrowRight,
  Users,
  FileSignature,
  CalendarCheck,
  MessageSquare,
  BellRing,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { getDashboardData } from "@/lib/data";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueAreaChart, OccupancyDonut, MethodBarChart } from "@/components/admin/charts";
import { formatFCFA, formatFCFACompact, formatNumber, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ACTION_META: Record<string, { icon: typeof AlertTriangle; color: string }> = {
  impaye: { icon: AlertTriangle, color: "text-rose-500 bg-rose-50 dark:bg-rose-500/15" },
  echeance: { icon: CalendarClock, color: "text-sky-500 bg-sky-50 dark:bg-sky-500/15" },
  maintenance: { icon: Wrench, color: "text-gold-500 bg-gold-50 dark:bg-gold-500/15" },
  expire: { icon: FileX2, color: "text-ink-400 bg-ink-100 dark:bg-ink-800" },
};

export default async function DashboardPage() {
  const data = await getDashboardData();
  const k = data.kpi;

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre activité immobilière">
        <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink-500 border border-surface dark:text-ink-400">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </span>
      </PageHeader>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Taux d&apos;occupation"
          value={k.tauxOccupation}
          format="percent"
          sub={`${k.nbLoues}/${k.totalBiens} biens loués`}
          icon={Building2}
          accent="brand"
        />
        <StatCard
          label="Revenus encaissés (mois)"
          value={k.revenuMois}
          format="fcfa"
          sub="Encaissements du mois en cours"
          icon={Wallet}
          accent="gold"
          trend={k.revenuDelta >= 0 ? "up" : "down"}
          trendLabel={`${k.revenuDelta >= 0 ? "+" : ""}${k.revenuDelta}%`}
        />
        <StatCard
          label="Loyers en attente"
          value={k.loyersEnAttente}
          format="fcfa"
          sub="À encaisser"
          icon={Clock}
          accent="sky"
        />
        <StatCard
          label="Loyers en retard"
          value={k.loyersEnRetard}
          format="fcfa"
          sub="Impayés à relancer"
          icon={AlertTriangle}
          accent="rose"
        />
      </div>

      {/* Stats secondaires */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Building2, v: formatNumber(k.totalBiens), l: "Biens au catalogue", to: "/admin/biens" },
          { icon: Building2, v: formatNumber(k.nbDisponibles), l: "Disponibles", to: "/admin/biens" },
          { icon: Users, v: formatNumber(k.totalLocataires), l: "Locataires", to: "/admin/locataires" },
          { icon: FileSignature, v: formatNumber(k.totalContratsActifs), l: "Contrats actifs", to: "/admin/contrats" },
          { icon: CalendarCheck, v: formatNumber(k.visitesNouvelles), l: "Visites à traiter", to: "/admin/visites" },
          { icon: MessageSquare, v: formatNumber(k.messagesNouveaux), l: "Messages nouveaux", to: "/admin/messages" },
          { icon: Wrench, v: formatNumber(k.signalementsOuverts), l: "Signalements ouverts", to: "/admin/signalements" },
          { icon: BellRing, v: formatNumber(k.recherchesActives), l: "Alertes actives", to: "/admin/alertes" },
        ].map((s) => (
          <Link key={s.l} href={s.to} className="card flex items-center gap-3 p-4 transition hover:shadow-soft">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-xl font-bold text-ink-900 dark:text-white">{s.v}</div>
              <div className="text-xs text-ink-500 dark:text-ink-400">{s.l}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Graphiques */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Évolution des revenus encaissés</h2>
              <p className="text-xs text-ink-500 dark:text-ink-400">12 derniers mois</p>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400">
              {k.revenuDelta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {formatFCFACompact(k.revenuMois)} ce mois
            </span>
          </div>
          <RevenueAreaChart data={data.revenueSeries} />
        </div>

        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Taux d&apos;occupation</h2>
          <p className="text-xs text-ink-500 dark:text-ink-400">Répartition par statut</p>
          <div className="mt-2">
            <OccupancyDonut data={data.occupancy} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.occupancy.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-ink-600 dark:text-ink-300">{d.name}</span>
                <span className="ml-auto font-semibold text-ink-800 dark:text-ink-100">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions urgentes + méthodes */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Actions urgentes</h2>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
              {data.actions.length} à traiter
            </span>
          </div>
          {data.actions.length === 0 ? (
            <div className="py-10 text-center text-sm text-ink-400">Aucune action urgente 🎉</div>
          ) : (
            <div className="space-y-2">
              {data.actions.map((a) => {
                const m = ACTION_META[a.type] ?? ACTION_META.impaye;
                return (
                  <Link
                    key={a.id}
                    href={a.href}
                    className="flex items-center gap-3 rounded-xl border border-surface p-3 transition hover:bg-surface-2"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${m.color}`}>
                      <m.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink-800 dark:text-ink-100">{a.label}</span>
                        {a.severity === "high" && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-600 dark:bg-rose-500/20 dark:text-rose-300">
                            Urgent
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-ink-500 dark:text-ink-400">{a.detail}</div>
                    </div>
                    {a.montant && <span className="text-sm font-bold text-ink-900 dark:text-white">{a.montant}</span>}
                    <ArrowRight className="h-4 w-4 shrink-0 text-ink-300" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Encaissements par moyen</h2>
          <p className="text-xs text-ink-500 dark:text-ink-400">Cumul des paiements réglés</p>
          <div className="mt-2">
            <MethodBarChart data={data.methodesBreakdown} />
          </div>
        </div>
      </div>

      {/* Renouvellements à venir */}
      <div className="mt-4 card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">Renouvellements à venir</h2>
          <CalendarClock className="h-5 w-5 text-brand-500" />
        </div>
        {data.renouvellements.length === 0 ? (
          <div className="py-8 text-center text-sm text-ink-400">Aucun renouvellement prévu.</div>
        ) : (
          <div className="space-y-2">
            {data.renouvellements.map((r) => (
              <Link key={r.id} href={`/admin/contrats/${r.id}`} className="flex items-center gap-3 rounded-xl border border-surface p-3 transition hover:bg-surface-2">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${r.jours <= 30 ? "bg-gold-50 text-gold-600 dark:bg-gold-500/15 dark:text-gold-300" : "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"}`}>
                  <CalendarClock className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{r.bien}</div>
                  <div className="truncate text-xs text-ink-400">{r.locataire}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-ink-800 dark:text-ink-100">{formatDate(r.dateFin)}</div>
                  <div className={`text-xs ${r.jours <= 30 ? "text-gold-600 dark:text-gold-400" : "text-ink-400"}`}>dans {r.jours} j</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
