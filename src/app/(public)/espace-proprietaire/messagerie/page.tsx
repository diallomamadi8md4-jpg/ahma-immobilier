import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getPortailSession } from "@/lib/portail-session";
import { PortalHeader } from "@/components/public/portal-header";
import { Messagerie } from "@/components/shared/messagerie";
import type { Actor } from "@/lib/actor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messagerie — Espace propriétaire" };

export default async function MessagerieProprietairePage() {
  const session = await getPortailSession();
  if (!session || session.role !== "proprietaire") redirect("/connexion-proprietaire");

  const biens = await prisma.bien.findMany({
    where: { proprietaireId: session.id },
    select: { id: true, titre: true },
    orderBy: { titre: "asc" },
  });

  const actor: Actor = { role: "proprietaire", id: session.id, nom: session.nom };

  return (
    <>
      <PortalHeader
        eyebrow="Espace propriétaire"
        title="Messagerie"
        subtitle="Vos échanges avec l'agence et les parties concernées par vos biens."
        backHref="/espace-proprietaire"
      />
      <section className="container py-8">
        <Messagerie actor={actor} biens={biens} />
      </section>
    </>
  );
}
