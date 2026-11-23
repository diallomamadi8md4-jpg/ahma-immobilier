import { cookies } from "next/headers";
import prisma from "./prisma";
import { SESSION_COOKIE, signSession, verifySession, type SessionPayload } from "./auth";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
};

export async function createSession(admin: { id: number; email: string; nom: string }) {
  const token = await signSession({
    id: admin.id,
    email: admin.email,
    nom: admin.nom,
  });
  cookies().set(SESSION_COOKIE, token, COOKIE_OPTS);
}

export async function destroySession() {
  cookies().delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/** Vérifie qu'il y a une session valide, sinon lève (pour usage dans layout server). */
export async function requireSession(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s) {
    throw new Error("UNAUTHORIZED");
  }
  return s;
}
