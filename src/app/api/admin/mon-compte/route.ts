import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createSession, getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Met à jour le profil de l'administrateur connecté et/ou son mot de passe. */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  try {
    const admin = await prisma.admin.findUnique({ where: { id: session.id } });
    if (!admin) return NextResponse.json({ error: "Compte introuvable." }, { status: 401 });

    const body = await req.json();
    const nom = String(body?.nom ?? admin.nom).trim();
    const email = String(body?.email ?? admin.email).toLowerCase().trim();
    const actuel = String(body?.motDePasseActuel ?? "");
    const nouveau = String(body?.nouveauMotDePasse ?? "");
    const confirmation = String(body?.confirmation ?? "");
    const changePassword = Boolean(actuel || nouveau || confirmation);

    if (nom.length < 2) {
      return NextResponse.json({ error: "Le nom doit contenir au moins 2 caractères." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    if (changePassword) {
      if (!(await bcrypt.compare(actuel, admin.passwordHash))) {
        return NextResponse.json({ error: "Le mot de passe actuel est incorrect." }, { status: 403 });
      }
      if (nouveau.length < 10) {
        return NextResponse.json({ error: "Le nouveau mot de passe doit contenir au moins 10 caractères." }, { status: 400 });
      }
      if (nouveau !== confirmation) {
        return NextResponse.json({ error: "La confirmation du mot de passe ne correspond pas." }, { status: 400 });
      }
      if (nouveau === actuel) {
        return NextResponse.json({ error: "Choisissez un mot de passe différent de l'actuel." }, { status: 400 });
      }
    }

    const taken = await prisma.admin.findUnique({ where: { email } });
    if (taken && taken.id !== admin.id) {
      return NextResponse.json({ error: "Cet email est déjà utilisé par un administrateur." }, { status: 409 });
    }

    const updated = await prisma.admin.update({
      where: { id: admin.id },
      data: {
        nom: nom.slice(0, 120),
        email: email.slice(0, 160),
        ...(changePassword ? { passwordHash: await bcrypt.hash(nouveau, 12) } : {}),
      },
      select: { id: true, nom: true, email: true },
    });

    await createSession({ id: updated.id, email: updated.email, nom: updated.nom });
    revalidatePath("/admin/mon-compte");
    revalidatePath("/admin");
    return NextResponse.json({ ok: true, admin: updated });
  } catch {
    return NextResponse.json({ error: "Impossible d'enregistrer les modifications." }, { status: 500 });
  }
}
