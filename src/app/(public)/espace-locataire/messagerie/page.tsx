import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getPortailSession } from "@/lib/portail-session";
import { PortalHeader } from "@/components/public/portal-header";
import { Messagerie } from "@/components/shared/messagerie";
import type { Actor } from "@/lib/actor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messagerie — Espace locataire" };

export default async function MessagerieLocatairePage() {
  const session = await getPortailSession();
  if (!session || session.role !== "locataire") redirect("/connexion-locataire");

  const biens = await prisma.bien.findMany({
    where: { contrats: { some: { locataireId: session.id } } },
    select: { id: true, titre: true },
    orderBy: { titre: "asc" },
  });

  const actor: Actor = { role: "locataire", id: session.id, nom: session.nom };

  return (
    <>
      <PortalHeader
        eyebrow="Espace locataire"
        title="Messagerie"
        subtitle="Vos échanges directs et sécurisés avec l'agence Ahma Immobilier."
        backHref="/espace-locataire"
      />
      <section className="container py-8">
        <Messagerie actor={actor} biens={biens} />
      </section>
    </>
  );
}
