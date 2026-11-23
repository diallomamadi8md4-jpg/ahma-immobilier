import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActor } from "@/lib/actor";
import { parseArray } from "@/lib/utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function rechercheIds(req: NextRequest, token?: string): Promise<number[] | null> {
  const actor = await getActor(req);
  if (token) {
    const r = await prisma.rechercheSauvegardee.findUnique({ where: { token }, select: { id: true } });
    return r ? [r.id] : null;
  }
  if (!actor) return null;
  if (actor.role === "admin") {
    const all = await prisma.rechercheSauvegardee.findMany({ select: { id: true } });
    return all.map((r) => r.id);
  }
  const all = await prisma.rechercheSauvegardee.findMany({
    where: actor.role === "locataire" ? { locataireId: actor.id } : { proprietaireId: actor.id },
    select: { id: true },
  });
  return all.map((r) => r.id);
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token") ?? undefined;
    const ids = await rechercheIds(req, token);
    if (!ids) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

    const alertes = await prisma.alerte.findMany({
      where: { rechercheId: { in: ids } },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { bien: true },
    });

    return NextResponse.json({
      count: alertes.filter((a) => !a.lu).length,
      alertes: alertes.map((a) => ({
        id: a.id,
        rechercheId: a.rechercheId,
        bienId: a.bienId,
        titre: a.bien.titre,
        quartier: a.bien.quartier,
        loyer: a.bien.loyer,
        photo: parseArray(a.bien.photos)[0] ?? null,
        lu: a.lu,
        createdAt: a.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Impossible de charger les alertes." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token : undefined;
    const idsAcces = await rechercheIds(req, token);
    if (!idsAcces) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

    const where = body?.all
      ? { rechercheId: { in: idsAcces }, lu: false }
      : { id: { in: Array.isArray(body?.ids) ? body.ids.map(Number).filter(Number.isInteger) : [] }, rechercheId: { in: idsAcces } };

    const result = await prisma.alerte.updateMany({ where, data: { lu: true } });
    return NextResponse.json({ ok: true, updated: result.count });
  } catch {
    return NextResponse.json({ error: "Impossible de mettre à jour les alertes." }, { status: 500 });
  }
}
