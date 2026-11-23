import prisma from "@/lib/prisma";
import type { Actor } from "@/lib/actor";

export type ParticipantInput = { role: "admin" | "locataire" | "proprietaire"; id: number; nom: string };

/** Vérifie que l'acteur fait bien partie de la conversation. */
export async function canAccessConversation(conversationId: number, actor: Actor) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true },
  });
  if (!conversation) return null;
  const allowed = actor.role === "admin"
    ? conversation.participants.some((p) => p.role === "admin")
    : conversation.participants.some((p) => p.role === actor.role && p.refId === actor.id);
  return allowed ? conversation : null;
}

export async function resolveParticipant(role: string, id: number): Promise<ParticipantInput | null> {
  if (role === "admin") {
    const a = await prisma.admin.findUnique({ where: { id } });
    return a ? { role: "admin", id: a.id, nom: a.nom } : null;
  }
  if (role === "locataire") {
    const l = await prisma.locataire.findUnique({ where: { id } });
    return l ? { role: "locataire", id: l.id, nom: `${l.prenom ? l.prenom + " " : ""}${l.nom}`.trim() } : null;
  }
  if (role === "proprietaire") {
    const p = await prisma.proprietaire.findUnique({ where: { id } });
    return p ? { role: "proprietaire", id: p.id, nom: `${p.prenom ? p.prenom + " " : ""}${p.nom}`.trim() } : null;
  }
  return null;
}

export function participantWhere(actor: Actor) {
  if (actor.role === "admin") return { role: "admin", refId: actor.id };
  return { role: actor.role, refId: actor.id };
}

export async function conversationsFor(actor: Actor) {
  const where = actor.role === "admin"
    ? { participants: { some: { role: "admin" as const } } }
    : { participants: { some: { role: actor.role, refId: actor.id } } };

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      participants: true,
      bien: { select: { id: true, titre: true } },
      messages: { orderBy: { createdAt: "desc" } },
    },
  });

  const lastRead = await prisma.conversationParticipant.findMany({ where: participantWhere(actor) });
  const readMap = new Map(lastRead.map((p) => [p.conversationId, p.lastReadAt]));

  return conversations.map((c) => {
    const last = c.messages[0];
    const seuil = readMap.get(c.id) ?? new Date(0);
    return {
      id: c.id,
      sujet: c.sujet,
      bienTitre: c.bien?.titre ?? null,
      participants: c.participants
        .filter((p) => !(p.role === actor.role && p.refId === actor.id))
        .map((p) => ({ role: p.role, nom: p.nom })),
      dernierMessage: last
        ? { contenu: last.contenu, createdAt: last.createdAt, auteurNom: last.auteurNom, auteurRole: last.auteurRole }
        : null,
      unread: c.messages.filter((m) => m.createdAt > seuil && !(m.auteurRole === actor.role && m.auteurRefId === actor.id)).length,
      updatedAt: c.updatedAt,
    };
  });
}
