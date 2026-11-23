import { NextRequest } from "next/server";
import PDFDocument from "pdfkit";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { formatFCFA, formatDateLong, monthLabel, METHODE_LABEL, PAIEMENT_STATUT_META } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BRAND = "#047857";
const BRAND_DARK = "#022c22";
const GOLD = "#f59e0b";
const INK = "#0f1f1c";
const MUTE = "#6e7c78";
const SOFT = "#f5f8f7";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return new Response("Non autorisé", { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return new Response("Paiement introuvable", { status: 404 });

  const paiement = await prisma.paiement.findUnique({
    where: { id },
    include: { bien: true, locataire: true, contrat: true },
  });
  if (!paiement) return new Response("Paiement introuvable", { status: 404 });
  // Une quittance atteste d'un encaissement : elle ne peut être émise que pour un paiement réglé.
  if (paiement.statut !== "paye") {
    return new Response("Aucune quittance disponible : le paiement n'est pas encore encaissé.", { status: 409 });
  }

  const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: "Quittance de loyer — Ahma Immobilier" } });
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((res) => doc.on("end", () => res(Buffer.concat(chunks))));

  const W = doc.page.width;
  const H = doc.page.height;
  const locataireNom = [paiement.locataire.prenom, paiement.locataire.nom].filter(Boolean).join(" ");
  const quittanceNum = `Q-${paiement.id.toString().padStart(5, "0")}-${paiement.moisConcerne.replace("-", "")}`;

  // ---------- En-tête ----------
  doc.fillColor(BRAND).rect(0, 0, W, 120).fill();
  doc.fillColor(GOLD).rect(0, 120, W, 6).fill();
  doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold").text("AHMA IMMOBILIER", 50, 42);
  doc.fontSize(9).font("Helvetica").fillColor("#dceee4").text("Gestion locative premium  ·  Abidjan, Côte d'Ivoire", 50, 74);
  doc.fillColor("#f5c85a").text("contact@ahma-immobilier.ci   ·   +225 07 12 27 57 13", 50, 90);

  // Numéro de quittance (à droite)
  doc.fillColor("#ffffff").fontSize(9).font("Helvetica-Bold").text("QUITTANCE N°", W - 220, 44, { width: 170, align: "right" });
  doc.fontSize(13).text(quittanceNum, W - 220, 58, { width: 170, align: "right" });
  doc.fontSize(9).font("Helvetica").fillColor("#dceee4").text(`Émise le ${formatDateLong(new Date())}`, W - 220, 78, { width: 170, align: "right" });

  // ---------- Titre ----------
  doc.fillColor(INK).fontSize(20).font("Helvetica-Bold").text("QUITTANCE DE LOYER", 50, 152, { width: W - 100, align: "center" });
  doc.fillColor(MUTE).fontSize(10).font("Helvetica").text("Reçu de paiement — location immobilière", 50, 178, { width: W - 100, align: "center" });

  // ---------- Bloc infos ----------
  let y = 210;
  const row = (label: string, value: string) => {
    doc.fillColor(MUTE).fontSize(8.5).font("Helvetica-Bold").text(label.toUpperCase(), 60, y);
    doc.fillColor(INK).fontSize(11).font("Helvetica").text(value, 220, y - 1, { width: W - 290 });
    y += 30;
  };
  row("Locataire", locataireNom);
  row("Référence", paiement.reference || `#${paiement.id}`);
  row("Bien concerné", paiement.bien.titre);
  row("Localisation", paiement.bien.quartier + (paiement.bien.adresse ? ` — ${paiement.bien.adresse}` : ""));
  row("Période du loyer", monthLabel(paiement.moisConcerne));
  row("Mode de règlement", METHODE_LABEL[paiement.methode] ?? paiement.methode);
  row("Date d'encaissement", formatDateLong(paiement.datePaiement));

  // ---------- Encadré montant ----------
  y += 6;
  doc.fillColor(BRAND_DARK).roundedRect(60, y, W - 120, 70, 12).fill();
  doc.fillColor("#a7f3d0").fontSize(9).font("Helvetica-Bold").text("MONTANT ENCAISSÉ", 80, y + 14);
  doc.fillColor("#ffffff").fontSize(26).font("Helvetica-Bold").text(formatFCFA(paiement.montant), 80, y + 30);
  const statutLabel = PAIEMENT_STATUT_META[paiement.statut]?.label ?? paiement.statut;
  doc.fillColor("#d1fae5").fontSize(9.5).font("Helvetica-Bold").text(statutLabel.toUpperCase(), W - 80, y + 28, { width: 120, align: "right" });

  // ---------- Mention ----------
  y += 96;
  doc.fillColor(INK).fontSize(10.5).font("Helvetica").text(
    `Reçu de ${locataireNom}, la somme de ${formatFCFA(paiement.montant)}, au titre du loyer du mois de ${monthLabel(paiement.moisConcerne)} du bien « ${paiement.bien.titre} » situé à ${paiement.bien.quartier}.`,
    60,
    y,
    { width: W - 120, lineGap: 4 }
  );

  // ---------- Signatures ----------
  const sy = H - 150;
  doc.moveTo(60, sy).lineTo(240, sy).lineWidth(1).strokeColor(MUTE).stroke();
  doc.fillColor(MUTE).fontSize(9).font("Helvetica").text("Le gestionnaire", 60, sy + 8);
  doc.moveTo(W - 240, sy).lineTo(W - 60, sy).stroke();
  doc.fillColor(MUTE).text("Cachet Ahma Immobilier", W - 240, sy + 8);

  // ---------- Pied de page ----------
  doc.fillColor(BRAND).rect(0, H - 48, W, 48).fill();
  doc.fillColor("#dceee4").fontSize(8).font("Helvetica").text(
    `Ahma Immobilier — Cocody Riviera 2, Abidjan  ·  document généré le ${formatDateLong(new Date())}`,
    60,
    H - 30,
    { width: W - 120, align: "center" }
  );

  doc.end();
  const pdf = await done;
  const filename = `quittance-${quittanceNum}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
