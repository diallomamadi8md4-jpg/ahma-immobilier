import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createSession, getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function currentAdmin() {
  const session = await getSession();
  if (!session) return null;
  const admin = await prisma.admin.findUnique({ where: { id: session.id } });
  return admin ? { session, admin } : null;
}

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const actor = await currentAdmin();
  if (!actor) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Compte invalide." }, { status: 400 });

  try {
    const body = await req.json();
    const nom = String(body?.nom ?? "").trim();
    const email = String(body?.email ?? "").toLowerCase().trim();
    const password = String(body?.password ?? "");

    if (nom.length < 2) {
      return NextResponse.json({ error: "Le nom doit contenir au moins 2 caractères." }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }
    if (password && password.length < 10) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 10 caractères." }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

    const taken = await prisma.admin.findUnique({ where: { email } });
    if (taken && taken.id !== id) {
      return NextResponse.json({ error: "Cet email est déjà utilisé par un administrateur." }, { status: 409 });
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: {
        nom: nom.slice(0, 120),
        email: email.slice(0, 160),
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
      },
      select: { id: true, nom: true, email: true, createdAt: true },
    });

    // Si l'admin modifie son propre profil, on rafraîchit le cookie pour que
    // le nom et l'email affichés dans l'interface restent cohérents.
    if (actor.session.id === id) {
      await createSession({ id: admin.id, email: admin.email, nom: admin.nom });
    }
    revalidatePath("/admin/comptes");
    revalidatePath("/admin/mon-compte");
    return NextResponse.json({ ok: true, admin });
  } catch {
    return NextResponse.json({ error: "Impossible de modifier le compte." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const actor = await currentAdmin();
  if (!actor) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Compte invalide." }, { status: 400 });
  if (actor.session.id === id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }

  try {
    const count = await prisma.admin.count();
    if (count <= 1) {
      return NextResponse.json({ error: "Le dernier administrateur ne peut pas être supprimé." }, { status: 400 });
    }
    await prisma.admin.delete({ where: { id } });
    revalidatePath("/admin/comptes");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Impossible de supprimer le compte." }, { status: 500 });
  }
}
