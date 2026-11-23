import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = (string | number | null | undefined)[];

function csv(headers: string[], rows: Row[]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  return "\uFEFF" + [headers, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}

function response(content: string, name: string): Response {
  return new Response(content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ahma-${name}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return new Response("Non autorisé", { status: 401 });

  switch (params.type) {
    case "biens": {
      const items = await prisma.bien.findMany({
        include: { proprietaire: true }, orderBy: { createdAt: "desc" },
      });
      return response(csv(
        ["ID", "Titre", "Type", "Statut", "Quartier", "Adresse", "Surface m2", "Chambres", "Loyer FCFA", "Prix vente FCFA", "Proprietaire"],
        items.map((b) => [b.id, b.titre, b.type, b.statut, b.quartier, b.adresse, b.superficie, b.nbChambres, b.loyer, b.prixVente,
          b.proprietaire ? `${b.proprietaire.prenom ?? ""} ${b.proprietaire.nom}`.trim() : ""])
      ), "biens");
    }
    case "paiements": {
      const items = await prisma.paiement.findMany({
        include: { bien: true, locataire: true }, orderBy: { datePaiement: "desc" },
      });
      return response(csv(
        ["ID", "Mois", "Bien", "Locataire", "Montant FCFA", "Date", "Methode", "Statut", "Reference"],
        items.map((p) => [p.id, p.moisConcerne, p.bien.titre, `${p.locataire.prenom ?? ""} ${p.locataire.nom}`.trim(), p.montant,
          p.datePaiement.toISOString().slice(0, 10), p.methode, p.statut, p.reference])
      ), "paiements");
    }
    case "contrats": {
      const items = await prisma.contrat.findMany({
        include: { bien: true, locataire: true }, orderBy: { createdAt: "desc" },
      });
      return response(csv(
        ["ID", "Bien", "Locataire", "Debut", "Fin", "Loyer mensuel FCFA", "Statut"],
        items.map((c) => [c.id, c.bien.titre, `${c.locataire.prenom ?? ""} ${c.locataire.nom}`.trim(),
          c.dateDebut.toISOString().slice(0, 10), c.dateFin.toISOString().slice(0, 10), c.loyerMensuel, c.statut])
      ), "contrats");
    }
    case "visites": {
      const items = await prisma.visite.findMany({ include: { bien: true }, orderBy: { createdAt: "desc" } });
      return response(csv(
        ["ID", "Bien", "Nom", "Telephone", "Email", "Date souhaitee", "Message", "Statut", "Recue le"],
        items.map((v) => [v.id, v.bien.titre, v.nom, v.telephone, v.email, v.dateSouhaitee, v.message, v.statut, v.createdAt.toISOString().slice(0, 10)])
      ), "visites");
    }
    case "signalements": {
      const items = await prisma.signalement.findMany({ include: { bien: true }, orderBy: { createdAt: "desc" } });
      return response(csv(
        ["ID", "Bien", "Nom", "Telephone", "Email", "Type", "Urgence", "Description", "Statut", "Recu le"],
        items.map((s) => [s.id, s.bien?.titre, s.nom, s.telephone, s.email, s.type, s.urgence, s.description, s.statut, s.createdAt.toISOString().slice(0, 10)])
      ), "signalements");
    }
    case "messages": {
      const items = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
      return response(csv(
        ["ID", "Nom", "Email", "Telephone", "Sujet", "Message", "Statut", "Recu le"],
        items.map((m) => [m.id, m.nom, m.email, m.telephone, m.sujet, m.contenu, m.statut, m.createdAt.toISOString().slice(0, 10)])
      ), "messages");
    }
    default:
      return new Response("Export inconnu", { status: 404 });
  }
}
