import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const bienId = Number(body.bienId);
    const nom = String(body.nom ?? "").trim();
    const telephone = String(body.telephone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const dateSouhaitee = String(body.dateSouhaitee ?? "").trim();
    const message = String(body.message ?? "").trim();

    // Honeypot : les bots remplissent souvent ce champ caché.
    if (body.site) return NextResponse.json({ ok: true });

    if (!Number.isInteger(bienId) || bienId <= 0 || nom.length < 2 || telephone.length < 6) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre nom et un numéro de téléphone valide." },
        { status: 400 }
      );
    }
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "Message trop long." }, { status: 400 });
    }

    const bien = await prisma.bien.findUnique({ where: { id: bienId }, select: { id: true } });
    if (!bien) return NextResponse.json({ error: "Bien introuvable." }, { status: 404 });

    const visite = await prisma.visite.create({
      data: {
        bienId,
        nom: nom.slice(0, 120),
        telephone: telephone.slice(0, 40),
        email: email ? email.slice(0, 160) : null,
        dateSouhaitee: dateSouhaitee || null,
        message: message || null,
      },
    });

    return NextResponse.json({ ok: true, reference: `V-${String(visite.id).padStart(5, "0")}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible d'enregistrer la demande. Réessayez." }, { status: 500 });
  }
}
