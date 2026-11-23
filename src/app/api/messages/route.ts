import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUJETS = ["location", "vente", "gestion", "quittance", "autre"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.site) return NextResponse.json({ ok: true });

    const nom = String(body.nom ?? "").trim();
    const email = String(body.email ?? "").toLowerCase().trim();
    const telephone = String(body.telephone ?? "").trim();
    const sujet = String(body.sujet ?? "autre");
    const contenu = String(body.contenu ?? "").trim();

    if (nom.length < 2 || !EMAIL_RE.test(email) || contenu.length < 10 || !SUJETS.includes(sujet)) {
      return NextResponse.json({ error: "Veuillez vérifier les champs obligatoires." }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        nom: nom.slice(0, 120),
        email: email.slice(0, 160),
        telephone: telephone ? telephone.slice(0, 40) : null,
        sujet,
        contenu: contenu.slice(0, 3000),
      },
    });

    return NextResponse.json({ ok: true, reference: `M-${String(message.id).padStart(5, "0")}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible d'envoyer le message." }, { status: 500 });
  }
}
