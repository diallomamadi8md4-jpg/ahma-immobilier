import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Sert une photo stockée en base (déploiement cloud sans filesystem persistant). */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return new Response("Identifiant invalide", { status: 400 });
  }

  const photo = await prisma.photoUpload.findUnique({ where: { id } });
  if (!photo) {
    return new Response("Photo introuvable", { status: 404 });
  }

  return new Response(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.contentType || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
