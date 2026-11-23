import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatDate, METHODE_LABEL, PAIEMENT_STATUT_META } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function esc(v: string): string {
  return /[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) return new Response("Non autorisé", { status: 401 });

  const paiements = await prisma.paiement.findMany({
    include: { bien: true, locataire: true },
    orderBy: { datePaiement: "desc" },
  });

  const header = [
    "Référence",
    "Date d'encaissement",
    "Mois concerné",
    "Locataire",
    "Bien",
    "Montant (FCFA)",
    "Moyen",
    "Statut",
  ];
  const rows = paiements.map((p) => [
    p.reference ?? `#${p.id}`,
    formatDate(p.datePaiement),
    p.moisConcerne,
    `${p.locataire.nom}${p.locataire.prenom ? " " + p.locataire.prenom : ""}`,
    p.bien.titre,
    String(p.montant),
    METHODE_LABEL[p.methode] ?? p.methode,
    PAIEMENT_STATUT_META[p.statut]?.label ?? p.statut,
  ]);

  const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
  const filename = `paiements_ahma_${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
