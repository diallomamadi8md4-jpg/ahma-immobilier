import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Hit = { type: string; id: number; label: string; sub?: string; href: string };

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const q = String(new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 1) return NextResponse.json({ results: [] });

  const [biens, locataires, proprietaires, contrats, paiements] = await Promise.all([
    prisma.bien.findMany({
      where: { OR: [{ titre: { contains: q } }, { quartier: { contains: q } }] },
      take: 6,
    }),
    prisma.locataire.findMany({
      where: { OR: [{ nom: { contains: q } }, { prenom: { contains: q } }, { email: { contains: q } }] },
      take: 5,
    }),
    prisma.proprietaire.findMany({
      where: { OR: [{ nom: { contains: q } }, { societe: { contains: q } }] },
      take: 5,
    }),
    prisma.contrat.findMany({
      include: { bien: true, locataire: true },
      where: { OR: [{ bien: { titre: { contains: q } } }, { locataire: { nom: { contains: q } } }] },
      take: 5,
    }),
    prisma.paiement.findMany({
      include: { bien: true, locataire: true },
      where: { OR: [{ reference: { contains: q } }, { bien: { titre: { contains: q } } }, { locataire: { nom: { contains: q } } }] },
      take: 6,
    }),
  ]);

  const results: Hit[] = [
    ...biens.map((b) => ({ type: "bien", id: b.id, label: b.titre, sub: b.quartier, href: `/admin/biens/${b.id}` })),
    ...locataires.map((l) => ({
      type: "locataire",
      id: l.id,
      label: `${l.nom}${l.prenom ? " " + l.prenom : ""}`,
      sub: l.email ?? l.telephone ?? "Locataire",
      href: `/admin/locataires/${l.id}`,
    })),
    ...proprietaires.map((p) => ({
      type: "proprietaire",
      id: p.id,
      label: `${p.nom}${p.prenom ? " " + p.prenom : ""}`,
      sub: p.societe ?? "Propriétaire",
      href: `/admin/proprietaires/${p.id}`,
    })),
    ...contrats.map((c) => ({
      type: "contrats",
      id: c.id,
      label: `Contrat #${c.id} · ${c.bien.titre}`,
      sub: c.locataire.nom,
      href: `/admin/contrats/${c.id}`,
    })),
    ...paiements.map((p) => ({
      type: "paiement",
      id: p.id,
      label: p.reference ?? `Paiement #${p.id}`,
      sub: `${p.bien.titre} · ${p.moisConcerne}`,
      href: `/admin/paiements`,
    })),
  ];

  return NextResponse.json({ results });
}
