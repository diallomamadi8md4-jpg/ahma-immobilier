import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { canAccessRecherche, getActor } from "@/lib/actor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Recherche invalide." }, { status: 400 });

    const body = await req.json();
    const token = typeof body?.token === "string" ? body.token : undefined;
    const actor = await getActor(req);

    const recherche = await prisma.rechercheSauvegardee.findUnique({ where: { id } });
    if (!recherche || !canAccessRecherche(recherche, token, actor)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const data: { actif?: boolean; frequence?: string } = {};
    if (typeof body?.actif === "boolean") data.actif = body.actif;
    if (body?.frequence === "quotidien" || body?.frequence === "hebdo") data.frequence = body.frequence;

    const updated = await prisma.rechercheSauvegardee.update({ where: { id }, data });
    return NextResponse.json({ ok: true, actif: updated.actif, frequence: updated.frequence });
  } catch {
    return NextResponse.json({ error: "Impossible de modifier la recherche." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const id = Number(params.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Recherche invalide." }, { status: 400 });

    const token = req.nextUrl.searchParams.get("token") ?? undefined;
    const actor = await getActor(req);
    const recherche = await prisma.rechercheSauvegardee.findUnique({ where: { id } });
    if (!recherche || !canAccessRecherche(recherche, token, actor)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    await prisma.rechercheSauvegardee.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Impossible de supprimer la recherche." }, { status: 500 });
  }
}
