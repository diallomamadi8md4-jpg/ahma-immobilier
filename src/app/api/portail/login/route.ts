import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { digits, fullName, PORTAIL_COOKIE, signPortail, type PortailRole } from "@/lib/portail-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const role = String(body?.role ?? "") as PortailRole;
    const email = String(body?.email ?? "").toLowerCase().trim();
    const telephone = digits(String(body?.telephone ?? ""));

    if ((role !== "locataire" && role !== "proprietaire") || !email || telephone.length < 8) {
      return NextResponse.json({ error: "Renseignez votre email et votre numéro de téléphone." }, { status: 400 });
    }

    if (role === "locataire") {
      const found = (await prisma.locataire.findMany({ where: { email } })).find(
        (l) => digits(l.telephone) === telephone
      );
      if (!found) {
        return NextResponse.json({ error: "Aucun compte locataire ne correspond à ces informations." }, { status: 401 });
      }
      const token = await signPortail({ role, id: found.id, nom: fullName(found.nom, found.prenom) });
      const res = NextResponse.json({ ok: true, nom: fullName(found.nom, found.prenom) });
      res.cookies.set(PORTAIL_COOKIE, token, {
        httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === "production",
      });
      return res;
    }

    const found = (await prisma.proprietaire.findMany({ where: { email } })).find(
      (p) => digits(p.telephone) === telephone
    );
    if (!found) {
      return NextResponse.json({ error: "Aucun compte propriétaire ne correspond à ces informations." }, { status: 401 });
    }
    const token = await signPortail({ role, id: found.id, nom: fullName(found.nom, found.prenom) });
    const res = NextResponse.json({ ok: true, nom: fullName(found.nom, found.prenom) });
    res.cookies.set(PORTAIL_COOKIE, token, {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Connexion impossible. Réessayez." }, { status: 500 });
  }
}
