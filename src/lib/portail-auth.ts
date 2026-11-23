import { SignJWT, jwtVerify } from "jose";

export const PORTAIL_COOKIE = "ahma_portail";

export type PortailRole = "locataire" | "proprietaire";

export interface PortailSession {
  role: PortailRole;
  id: number;
  nom: string;
}

function secret(): Uint8Array {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) {
    throw new Error("JWT_SECRET doit être défini avec au moins 32 caractères.");
  }
  return new TextEncoder().encode(value);
}

export async function signPortail(payload: PortailSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyPortail(token: string | undefined): Promise<PortailSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "locataire" && payload.role !== "proprietaire") return null;
    if (typeof payload.id !== "number" || typeof payload.nom !== "string") return null;
    return { role: payload.role, id: payload.id, nom: payload.nom };
  } catch {
    return null;
  }
}

export function digits(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "");
}

export function fullName(nom: string, prenom?: string | null): string {
  return `${prenom ? `${prenom} ` : ""}${nom}`.trim();
}
