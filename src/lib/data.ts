import prisma from "./prisma";
import { monthKey, formatDate, formatFCFA } from "./utils";

export async function getDashboardData() {
  const now = new Date();
  const currentMonth = monthKey(now);

  const [biens, paiements, contrats] = await Promise.all([
    prisma.bien.findMany(),
    prisma.paiement.findMany({ include: { bien: true, locataire: true, contrat: true } }),
    prisma.contrat.findMany({ include: { bien: true, locataire: true } }),
  ]);

  // --- KPIs ---
  const totalBiens = biens.length;
  const nbLoues = biens.filter((b) => b.statut === "loue").length;
  const nbDisponibles = biens.filter((b) => b.statut === "disponible").length;
  const tauxOccupation = totalBiens ? Math.round((nbLoues / totalBiens) * 100) : 0;

  const revenuMois = paiements
    .filter((p) => p.moisConcerne === currentMonth && p.statut === "paye")
    .reduce((s, p) => s + p.montant, 0);

  const loyersEnAttente = paiements
    .filter((p) => p.statut === "en_attente")
    .reduce((s, p) => s + p.montant, 0);

  const loyersEnRetard = paiements
    .filter((p) => p.statut === "retard")
    .reduce((s, p) => s + p.montant, 0);

  const revenuMoisPrecedent = (() => {
    const pm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const pk = monthKey(pm);
    return paiements
      .filter((p) => p.moisConcerne === pk && p.statut === "paye")
      .reduce((s, p) => s + p.montant, 0);
  })();
  const revenuDelta =
    revenuMoisPrecedent > 0 ? Math.round(((revenuMois - revenuMoisPrecedent) / revenuMoisPrecedent) * 100) : 0;

  // --- Série des revenus (12 derniers mois) ---
  const months: { key: string; label: string }[] = [];
  const MOIS_COURT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: MOIS_COURT[d.getMonth()] });
  }
  const revenueSeries = months.map((m) => ({
    mois: m.label,
    revenu: paiements
      .filter((p) => p.moisConcerne === m.key && p.statut === "paye")
      .reduce((s, p) => s + p.montant, 0),
  }));

  // --- Répartition des statuts (donut) ---
  const nbReserve = biens.filter((b) => b.statut === "reserve").length;
  const nbMaintenance = biens.filter((b) => b.statut === "maintenance").length;
  const occupancy = [
    { name: "Loués", value: nbLoues, color: "#10b981" },
    { name: "Disponibles", value: nbDisponibles, color: "#f59e0b" },
    { name: "Réservés", value: nbReserve, color: "#0ea5e9" },
    { name: "Maintenance", value: nbMaintenance, color: "#f43f5e" },
  ].filter((d) => d.value > 0);

  // --- Méthodes de paiement ---
  const methodeAgg: Record<string, number> = {};
  for (const p of paiements.filter((p) => p.statut === "paye")) {
    methodeAgg[p.methode] = (methodeAgg[p.methode] ?? 0) + p.montant;
  }
  const METHODE_LABEL: Record<string, string> = {
    especes: "Espèces",
    virement: "Virement",
    mobile_money: "Mobile Money",
    chequier: "Chèque",
  };
  const methodesBreakdown = Object.entries(methodeAgg).map(([k, v]) => ({
    methode: METHODE_LABEL[k] ?? k,
    montant: v,
  }));

  // --- Actions urgentes ---
  type Action = {
    id: string;
    type: "impaye" | "echeance" | "maintenance" | "expire";
    severity: "high" | "medium";
    label: string;
    detail: string;
    montant?: string;
    href: string;
  };
  const actions: Action[] = [];

  const retards = paiements
    .filter((p) => p.statut === "retard")
    .sort((a, b) => +new Date(b.datePaiement) - +new Date(a.datePaiement));
  for (const p of retards.slice(0, 6)) {
    actions.push({
      id: `imp-${p.id}`,
      type: "impaye",
      severity: "high",
      label: "Loyer en retard",
      detail: `${p.locataire.nom}${p.locataire.prenom ? " " + p.locataire.prenom : ""} · ${p.bien.titre}`,
      montant: formatFCFA(p.montant),
      href: `/admin/paiements`,
    });
  }
  const enAttente = paiements.filter((p) => p.statut === "en_attente").slice(0, 3);
  for (const p of enAttente) {
    actions.push({
      id: `att-${p.id}`,
      type: "impaye",
      severity: "medium",
      label: "Paiement en attente",
      detail: `${p.locataire.nom} · ${p.bien.titre}`,
      montant: formatFCFA(p.montant),
      href: `/admin/paiements`,
    });
  }

  const limite = new Date(now.getTime() + 45 * 24 * 3600 * 1000);
  const echeances = contrats
    .filter((c) => c.statut === "actif" && new Date(c.dateFin) <= limite && new Date(c.dateFin) >= now)
    .sort((a, b) => +new Date(a.dateFin) - +new Date(b.dateFin));
  for (const c of echeances.slice(0, 4)) {
    actions.push({
      id: `ech-${c.id}`,
      type: "echeance",
      severity: "medium",
      label: "Contrat à renouveler",
      detail: `${c.bien.titre} · échéance ${formatDate(c.dateFin)}`,
      href: `/admin/contrats/${c.id}`,
    });
  }

  const biensMaintenance = biens.filter((b) => b.statut === "maintenance");
  for (const b of biensMaintenance) {
    actions.push({
      id: `mnt-${b.id}`,
      type: "maintenance",
      severity: "medium",
      label: "Bien en maintenance",
      detail: b.titre,
      href: `/admin/biens/${b.id}`,
    });
  }

  const contratsExpires = contrats.filter((c) => c.statut === "expire").slice(0, 3);
  for (const c of contratsExpires) {
    actions.push({
      id: `exp-${c.id}`,
      type: "expire",
      severity: "medium",
      label: "Contrat expiré",
      detail: `${c.bien.titre} · ${c.locataire.nom}`,
      href: `/admin/contrats/${c.id}`,
    });
  }

  const renouvellements = contrats
    .filter((c) => c.statut === "actif" && new Date(c.dateFin) >= now)
    .sort((a, b) => +new Date(a.dateFin) - +new Date(b.dateFin))
    .slice(0, 6)
    .map((c) => ({
      id: c.id,
      bien: c.bien.titre,
      locataire: [c.locataire.prenom, c.locataire.nom].filter(Boolean).join(" "),
      dateFin: c.dateFin,
      jours: Math.ceil((+new Date(c.dateFin) - +now) / 86400000),
    }));

  return {
    kpi: {
      tauxOccupation,
      revenuMois,
      loyersEnAttente,
      loyersEnRetard,
      revenuDelta,
      totalBiens,
      nbLoues,
      nbDisponibles,
      totalLocataires: await prisma.locataire.count(),
      totalContratsActifs: contrats.filter((c) => c.statut === "actif").length,
      visitesNouvelles: await prisma.visite.count({ where: { statut: "nouvelle" } }),
      messagesNouveaux: await prisma.message.count({ where: { statut: "nouveau" } }),
      signalementsOuverts: await prisma.signalement.count({ where: { statut: { in: ["ouvert", "en_cours"] } } }),
      recherchesActives: await prisma.rechercheSauvegardee.count({ where: { actif: true } }),
    },
    revenueSeries,
    occupancy,
    methodesBreakdown,
    actions: actions.slice(0, 10),
    renouvellements,
  };
}
