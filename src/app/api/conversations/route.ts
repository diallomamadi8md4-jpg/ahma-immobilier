import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActor } from "@/lib/actor";
import { conversationsFor, resolveParticipant, type ParticipantInput } from "@/lib/messagerie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const actor = await getActor(req);
  if (!actor) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  return NextResponse.json({ conversations: await conversationsFor(actor) });
}

export async function POST(req: NextRequest) {
  try {
    const actor = await getActor(req);
    if (!actor) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

    const body = await req.json();
    const sujet = String(body?.sujet ?? "").trim().slice(0, 140);
    const contenu = String(body?.message ?? "").trim();
    if (sujet.length < 3 || contenu.length < 2 || contenu.length > 4000) {
      return NextResponse.json({ error: "Renseignez un sujet et un message." }, { status: 400 });
    }

    const bienId = Number(body?.bienId) || null;
    if (bienId && !(await prisma.bien.findUnique({ where: { id: bienId }, select: { id: true } }))) {
      return NextResponse.json({ error: "Bien introuvable." }, { status: 400 });
    }

    const participants: ParticipantInput[] = [
      { role: actor.role, id: actor.id, nom: actor.nom },
    ];

    if (actor.role === "admin") {
      const raw = Array.isArray(body?.destinataires) ? body.destinataires : [];
      for (const d of raw) {
        const role = String(d?.role ?? "");
        const id = Number(d?.id);
        if ((role !== "locataire" && role !== "proprietaire") || !Number.isInteger(id)) continue;
        const found = await resolveParticipant(role, id);
        if (found) participants.push(found);
      }
      if (participants.length < 2) {
        return NextResponse.json({ error: "Sélectionnez au moins un destinataire." }, { status: 400 });
      }
    } else {
      // Un client écrit toujours à l'agence ; un autre client peut être ajouté en copie.
      const admin = await prisma.admin.findFirst({ orderBy: { id: "asc" } });
      if (admin) participants.push({ role: "admin", id: admin.id, nom: admin.nom });
      const raw = Array.isArray(body?.destinataires) ? body.destinataires : [];
      for (const d of raw) {
        const role = String(d?.role ?? "");
        const id = Number(d?.id);
        if ((role !== "locataire" && role !== "proprietaire") || role === actor.role || !Number.isInteger(id)) continue;
        const found = await resolveParticipant(role, id);
        if (found) participants.push(found);
      }
    }

    const uniques = Array.from(
      new Map(participants.map((p) => [`${p.role}:${p.id}`, p])).values()
    );

    const conversation = await prisma.conversation.create({
      data: {
        sujet,
        bienId,
        participants: {
          create: uniques.map((p) => ({
            role: p.role,
            refId: p.id,
            nom: p.nom,
            // Le message initial est « non lu » pour les destinataires.
            lastReadAt: p.role === actor.role && p.id === actor.id ? new Date() : new Date(0),
          })),
        },
        messages: {
          create: {
            auteurRole: actor.role,
            auteurRefId: actor.id,
            auteurNom: actor.nom,
            contenu: contenu.slice(0, 4000),
          },
        },
      },
    });

    return NextResponse.json({ ok: true, id: conversation.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer la conversation." }, { status: 500 });
  }
}
