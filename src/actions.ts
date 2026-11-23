"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { destroySession, getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { parseArray } from "@/lib/utils";
import { notifyNouveauxBiens } from "@/lib/alertes";

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ---------- Helpers ----------
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
function num(f: FormData, k: string): number | null {
  const v = f.get(k);
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function dateOrNow(f: FormData, k: string): Date {
  const v = str(f, k);
  const d = v ? new Date(v) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
}

// ---------- Biens ----------
const DEFAULT_PHOTOS: Record<string, string[]> = {
  villa: ["/images/properties/villa-moderne.webp"],
  appartement: ["/images/properties/interieur-appartement.webp"],
  bureau: ["/images/properties/bureau-studio.webp"],
  terrain: ["/images/properties/terrain-vert.webp"],
  commerce: ["/images/properties/commerce-vitrine.webp"],
  magasin: ["/images/properties/commerce-vitrine.webp"],
};

export async function createBienAction(formData: FormData) {
  const proprietaireId = num(formData, "proprietaireId");
  if (proprietaireId) {
    const proprietaire = await prisma.proprietaire.findUnique({ where: { id: proprietaireId } });
    if (!proprietaire) throw new Error("Le propriétaire sélectionné n'existe pas.");
  }

  const equipements = str(formData, "equipements")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const bien = await prisma.bien.create({
    data: {
      titre: str(formData, "titre"),
      type: str(formData, "type") || "appartement",
      statut: str(formData, "statut") || "disponible",
      quartier: str(formData, "quartier"),
      adresse: str(formData, "adresse") || null,
      superficie: num(formData, "superficie") ?? 0,
      nbChambres: num(formData, "nbChambres"),
      nbSallesDeBain: num(formData, "nbSallesDeBain"),
      etage: num(formData, "etage"),
      description: str(formData, "description") || null,
      loyer: num(formData, "loyer"),
      prixVente: num(formData, "prixVente"),
      caution: num(formData, "caution"),
      equipements: JSON.stringify(equipements),
      photos: JSON.stringify(DEFAULT_PHOTOS[str(formData, "type")] ?? []),
      accent: str(formData, "accent") || "emerald",
      proprietaireId: proprietaireId ?? undefined,
    },
  });
  await notifyNouveauxBiens(bien);
  revalidatePath("/admin/biens");
  redirect("/admin/biens");
}

export async function updateBienStatutAction(id: number, statut: string) {
  const bien = await prisma.bien.update({ where: { id }, data: { statut } });
  if (statut === "disponible") await notifyNouveauxBiens(bien);
  revalidatePath("/admin/biens");
  revalidatePath(`/admin/biens/${id}`);
}

// ---------- Locataires ----------
export async function createLocataireAction(formData: FormData) {
  await prisma.locataire.create({
    data: {
      nom: str(formData, "nom"),
      prenom: str(formData, "prenom") || null,
      email: str(formData, "email") || null,
      telephone: str(formData, "telephone") || null,
      adresse: str(formData, "adresse") || null,
      profession: str(formData, "profession") || null,
      typePiece: str(formData, "typePiece") || null,
      numeroPiece: str(formData, "numeroPiece") || null,
    },
  });
  revalidatePath("/admin/locataires");
  redirect("/admin/locataires");
}

// ---------- Propriétaires ----------
export async function createProprietaireAction(formData: FormData) {
  await prisma.proprietaire.create({
    data: {
      nom: str(formData, "nom"),
      prenom: str(formData, "prenom") || null,
      email: str(formData, "email") || null,
      telephone: str(formData, "telephone") || null,
      typePersonne: str(formData, "typePersonne") || "physique",
      societe: str(formData, "societe") || null,
      adresse: str(formData, "adresse") || null,
      typePiece: str(formData, "typePiece") || null,
      numeroPiece: str(formData, "numeroPiece") || null,
    },
  });
  revalidatePath("/admin/proprietaires");
  redirect("/admin/proprietaires");
}

// ---------- Contrats ----------
export async function createContratAction(formData: FormData) {
  const bienId = num(formData, "bienId");
  const locataireId = num(formData, "locataireId");
  const statut = str(formData, "statut") || "actif";

  if (!bienId || !locataireId) throw new Error("Sélectionnez un bien et un locataire.");
  const [bien, locataire] = await Promise.all([
    prisma.bien.findUnique({ where: { id: bienId } }),
    prisma.locataire.findUnique({ where: { id: locataireId } }),
  ]);
  if (!bien || !locataire) throw new Error("Le bien ou le locataire sélectionné n'existe pas.");

  const contrat = await prisma.contrat.create({
    data: {
      bienId,
      locataireId,
      dateDebut: dateOrNow(formData, "dateDebut"),
      dateFin: dateOrNow(formData, "dateFin"),
      loyerMensuel: num(formData, "loyerMensuel") ?? 0,
      caution: num(formData, "caution"),
      depot: num(formData, "depot"),
      frequence: str(formData, "frequence") || "mensuel",
      statut,
      notes: str(formData, "notes") || null,
    },
  });

  // Synchroniser le statut du bien
  if (contrat.bienId) {
    const newStatut = statut === "actif" ? "loue" : statut === "a_venir" ? "reserve" : undefined;
    if (newStatut) await prisma.bien.update({ where: { id: contrat.bienId }, data: { statut: newStatut } });
  }

  revalidatePath("/admin/contrats");
  revalidatePath("/admin/biens");
  redirect("/admin/contrats");
}

// ---------- Paiements ----------
export async function createPaiementAction(formData: FormData) {
  const contratId = num(formData, "contratId");
  const contrat = contratId ? await prisma.contrat.findUnique({ where: { id: contratId } }) : null;
  if (!contrat) {
    revalidatePath("/admin/paiements");
    redirect("/admin/paiements");
  }

  await prisma.paiement.create({
    data: {
      contratId: contrat.id,
      locataireId: contrat.locataireId,
      bienId: contrat.bienId,
      montant: num(formData, "montant") ?? contrat.loyerMensuel,
      datePaiement: dateOrNow(formData, "datePaiement"),
      moisConcerne: str(formData, "moisConcerne") || new Date().toISOString().slice(0, 7),
      methode: str(formData, "methode") || "especes",
      statut: str(formData, "statut") || "paye",
      reference: str(formData, "reference") || null,
    },
  });
  revalidatePath("/admin/paiements");
  revalidatePath("/admin");
  redirect("/admin/paiements");
}

export async function updatePaiementStatutAction(id: number, statut: string) {
  await prisma.paiement.update({ where: { id }, data: { statut } });
  revalidatePath("/admin/paiements");
  revalidatePath("/admin");
}

// ---------- Photos des biens ----------
function revalidateBien(bienId: number) {
  revalidatePath(`/admin/biens/${bienId}`);
  revalidatePath("/admin/biens");
  revalidatePath("/biens");
  revalidatePath(`/biens/${bienId}`);
  revalidatePath("/");
}

export async function addBienPhotosAction(bienId: number, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    revalidateBien(bienId);
    return;
  }
  const bien = await prisma.bien.findUnique({ where: { id: bienId } });
  const existing = parseArray(bien?.photos);
  const saved: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const upload = await prisma.photoUpload.create({
      data: {
        bienId,
        contentType: file.type,
        data: Buffer.from(await file.arrayBuffer()),
      },
    });
    saved.push(`/api/photos/${upload.id}`);
  }
  if (saved.length) {
    await prisma.bien.update({
      where: { id: bienId },
      data: { photos: JSON.stringify([...existing, ...saved]) },
    });
  }
  revalidateBien(bienId);
}

export async function removeBienPhotoAction(bienId: number, index: number) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  const bien = await prisma.bien.findUnique({ where: { id: bienId } });
  const photos = parseArray(bien?.photos);
  if (index < 0 || index >= photos.length) return;
  const [removed] = photos.splice(index, 1);
  await prisma.bien.update({ where: { id: bienId }, data: { photos: JSON.stringify(photos) } });
  if (removed?.startsWith("/api/photos/")) {
    const photoId = Number(removed.split("/").pop());
    if (Number.isInteger(photoId)) {
      await prisma.photoUpload.deleteMany({ where: { id: photoId, bienId } });
    }
  }
  revalidateBien(bienId);
}

export async function setBienCoverAction(bienId: number, index: number) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  const bien = await prisma.bien.findUnique({ where: { id: bienId } });
  const photos = parseArray(bien?.photos);
  if (index <= 0 || index >= photos.length) return;
  const [moved] = photos.splice(index, 1);
  photos.unshift(moved);
  await prisma.bien.update({ where: { id: bienId }, data: { photos: JSON.stringify(photos) } });
  revalidateBien(bienId);
}

// ---------- Demandes de visite ----------
export async function setVisiteStatutAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const id = num(formData, "visiteId");
  const statut = str(formData, "statut");
  if (!id || !["nouvelle", "contactee", "planifiee", "annulee"].includes(statut)) return;

  await prisma.visite.update({ where: { id }, data: { statut } });
  revalidatePath("/admin/visites");
  revalidatePath("/admin");
}

// ---------- Signalements & messages ----------
export async function setSignalementStatutAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const id = num(formData, "signalementId");
  const statut = str(formData, "statut");
  if (!id || !["ouvert", "en_cours", "resolu"].includes(statut)) return;

  await prisma.signalement.update({ where: { id }, data: { statut } });
  revalidatePath("/admin/signalements");
  revalidatePath("/admin");
}

export async function setMessageStatutAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const id = num(formData, "messageId");
  const statut = str(formData, "statut");
  if (!id || !["nouveau", "traite", "archive"].includes(statut)) return;

  await prisma.message.update({ where: { id }, data: { statut } });
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

// ---------- Modification d'un bien ----------
export async function updateBienAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");

  const id = num(formData, "id");
  if (!id) throw new Error("Bien introuvable.");

  const proprietaireId = num(formData, "proprietaireId");
  if (proprietaireId) {
    const proprietaire = await prisma.proprietaire.findUnique({ where: { id: proprietaireId } });
    if (!proprietaire) throw new Error("Le propriétaire sélectionné n'existe pas.");
  }

  const equipements = str(formData, "equipements")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.bien.update({
    where: { id },
    data: {
      titre: str(formData, "titre"),
      type: str(formData, "type") || "appartement",
      statut: str(formData, "statut") || "disponible",
      quartier: str(formData, "quartier"),
      adresse: str(formData, "adresse") || null,
      superficie: num(formData, "superficie") ?? 0,
      nbChambres: num(formData, "nbChambres"),
      nbSallesDeBain: num(formData, "nbSallesDeBain"),
      etage: num(formData, "etage"),
      description: str(formData, "description") || null,
      loyer: num(formData, "loyer"),
      prixVente: num(formData, "prixVente"),
      caution: num(formData, "caution"),
      equipements: JSON.stringify(equipements),
      accent: str(formData, "accent") || "emerald",
      proprietaireId: proprietaireId ?? null,
    },
  });

  revalidateBien(id);
  revalidatePath("/admin/biens");
  redirect("/admin/biens");
}
