import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActor } from "@/lib/actor";
import { parseCriteria } from "@/lib/search";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").toLowerCase().trim();
    const nom = String(body?.nom ?? "").trim();
    const frequence = String(body?.frequence ?? "quotidien");
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    const criteres = parseCriteria(body?.criteres ?? {});
    const token = randomUUID();
    const actor = await getActor(req);

    const recherche = await prisma.rechercheSauvegardee.create({
      data: {
        email: email.slice(0, 160),
        nom: nom ? nom.slice(0, 100) : null,
        token,
        criteres: JSON.stringify(criteres),
        frequence: frequence === "hebdo" ? "hebdo" : "quotidien",
        locataireId: actor?.role === "locataire" ? actor.id : null,
        proprietaireId: actor?.role === "proprietaire" ? actor.id : null,
      },
    });

    return NextResponse.json(
      { ok: true, token: recherche.token, url: `/alertes?token=${recherche.token}` },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Impossible d'enregistrer la recherche." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token") ?? undefined;
    const actor = await getActor(req);
    if (!token && !actor) {
      return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
    }

    const where = token
      ? { token }
      : actor?.role === "admin"
      ? {}
      : actor?.role === "locataire"
      ? { locataireId: actor.id }
      : { proprietaireId: actor!.id };

    const recherches = await prisma.rechercheSauvegardee.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { alertes: true } } },
    });

    return NextResponse.json({
      recherches: recherches.map((r) => ({
        id: r.id,
        token: r.token,
        email: r.email,
        criteres: parseCriteria(r.criteres),
        frequence: r.frequence,
        actif: r.actif,
        createdAt: r.createdAt,
        alertes: r._count.alertes,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Impossible de charger les recherches." }, { status: 500 });
  }
}
