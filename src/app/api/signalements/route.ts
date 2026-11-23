import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const TYPES = ["plomberie", "electricite", "climatisation", "menage", "securite", "autre"];
const URGENCES = ["faible", "moyenne", "urgente"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.site) return NextResponse.json({ ok: true });

    const bienId = Number(body.bienId);
    const nom = String(body.nom ?? "").trim();
    const telephone = String(body.telephone ?? "").replace(/\D/g, "");
    const email = String(body.email ?? "").trim();
    const type = String(body.type ?? "");
    const urgence = String(body.urgence ?? "moyenne");
    const description = String(body.description ?? "").trim();

    if (!Number.isInteger(bienId) || bienId <= 0 || nom.length < 2 || telephone.length < 8 || description.length < 10) {
      return NextResponse.json({ error: "Veuillez compléter les champs obligatoires (description d'au moins 10 caractères)." }, { status: 400 });
    }
    if (!TYPES.includes(type) || !URGENCES.includes(urgence)) {
      return NextResponse.json({ error: "Type ou urgence invalide." }, { status: 400 });
    }
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    const bien = await prisma.bien.findUnique({ where: { id: bienId }, select: { id: true } });
    if (!bien) return NextResponse.json({ error: "Bien introuvable." }, { status: 404 });

    const signalement = await prisma.signalement.create({
      data: {
        bienId,
        nom: nom.slice(0, 120),
        telephone: telephone.slice(0, 30),
        email: email ? email.slice(0, 160) : null,
        type,
        urgence,
        description: description.slice(0, 3000),
      },
    });

    return NextResponse.json(
      { ok: true, reference: `S-${String(signalement.id).padStart(5, "0")}` },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Impossible d'enregistrer le signalement." }, { status: 500 });
  }
}
