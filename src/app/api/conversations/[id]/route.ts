import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getActor } from "@/lib/actor";
import { canAccessConversation, participantWhere } from "@/lib/messagerie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  const actor = await getActor(req);
  if (!actor) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Conversation invalide." }, { status: 400 });

  const conversation = await canAccessConversation(id, actor);
  if (!conversation) return NextResponse.json({ error: "Accès refusé." }, { status: 404 });

  await prisma.conversationParticipant.updateMany({
    where: { conversationId: id, ...participantWhere(actor) },
    data: { lastReadAt: new Date() },
  });

  const messages = await prisma.messageInterne.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      sujet: conversation.sujet,
      participants: conversation.participants.map((p) => ({ role: p.role, nom: p.nom })),
    },
    messages: messages.map((m) => ({
      id: m.id,
      contenu: m.contenu,
      createdAt: m.createdAt,
      auteurRole: m.auteurRole,
      auteurNom: m.auteurNom,
      own: m.auteurRole === actor.role && m.auteurRefId === actor.id,
    })),
  });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const actor = await getActor(req);
    if (!actor) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

    const id = Number(params.id);
    if (!Number.isInteger(id)) return NextResponse.json({ error: "Conversation invalide." }, { status: 400 });
    if (!(await canAccessConversation(id, actor))) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 404 });
    }

    const body = await req.json();
    const contenu = String(body?.contenu ?? "").trim();
    if (contenu.length < 2 || contenu.length > 4000) {
      return NextResponse.json({ error: "Le message est vide ou trop long." }, { status: 400 });
    }

    const message = await prisma.$transaction(async (tx) => {
      const created = await tx.messageInterne.create({
        data: {
          conversationId: id,
          auteurRole: actor.role,
          auteurRefId: actor.id,
          auteurNom: actor.nom,
          contenu: contenu.slice(0, 4000),
        },
      });
      await tx.conversation.update({ where: { id }, data: { updatedAt: new Date() } });
      return created;
    });

    return NextResponse.json({ ok: true, id: message.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible d'envoyer le message." }, { status: 500 });
  }
}
