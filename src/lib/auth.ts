import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const SESSION_COOKIE = "ahma_session";
const ALG = "HS256";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET doit être défini avec au moins 32 caractères.");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload extends JWTPayload {
  id: number;
  email: string;
  nom: string;
  poste?: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
