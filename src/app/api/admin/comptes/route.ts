import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function currentAdmin() {
  const session = await getSession();
  if (!session) return null;
  return prisma.admin.findUnique({ where: { id: session.id } });
}

export async function GET() {
  if (!(await currentAdmin())) {
    return NextResponse.json({ error: "Authentification requise." }, { status: 401 });
  }
  const admins = await prisma.admin.findMany({
    select: { id: true, nom: true, email: true, createdAt: true },
    orderBy: { id: "asc" },
  });
  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  const actor = await currentAdmin();
  if (!actor) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

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
    if (password.length < 10) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 10 caractères." }, { status: 400 });
    }
    if (await prisma.admin.findUnique({ where: { email } })) {
      return NextResponse.json({ error: "Cet email est déjà utilisé par un administrateur." }, { status: 409 });
    }

    const admin = await prisma.admin.create({
      data: { nom: nom.slice(0, 120), email: email.slice(0, 160), passwordHash: await bcrypt.hash(password, 12) },
      select: { id: true, nom: true, email: true, createdAt: true },
    });
    revalidatePath("/admin/comptes");
    return NextResponse.json({ ok: true, admin }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer le compte." }, { status: 500 });
  }
}
