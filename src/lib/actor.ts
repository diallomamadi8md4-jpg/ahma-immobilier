import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { PORTAIL_COOKIE, verifyPortail } from "@/lib/portail-auth";

export type ActorRole = "admin" | "locataire" | "proprietaire";
export type Actor = { role: ActorRole; id: number; nom: string };

/** Identifie l'utilisateur courant dans une route API (admin ou portail client). */
export async function getActor(req: NextRequest): Promise<Actor | null> {
  const admin = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (admin) return { role: "admin", id: admin.id, nom: admin.nom };
  const portail = await verifyPortail(req.cookies.get(PORTAIL_COOKIE)?.value);
  if (portail) return { role: portail.role, id: portail.id, nom: portail.nom };
  return null;
}

export function canAccessRecherche(
  recherche: { token: string; locataireId: number | null; proprietaireId: number | null },
  token: string | undefined,
  actor: Actor | null
): boolean {
  if (token && recherche.token === token) return true;
  if (!actor) return false;
  if (actor.role === "admin") return true;
  if (actor.role === "locataire") return recherche.locataireId === actor.id;
  return recherche.proprietaireId === actor.id;
}
