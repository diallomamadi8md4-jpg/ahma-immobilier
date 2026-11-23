import prisma from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Messagerie } from "@/components/shared/messagerie";
import { getSession } from "@/lib/session";
import type { Actor } from "@/lib/actor";

export const dynamic = "force-dynamic";

export default async function AdminMessageriePage() {
  const session = await getSession();
  const actor: Actor = {
    role: "admin",
    id: session?.id ?? 0,
    nom: session?.nom ?? "Agence Ahma",
  };

  const [locataires, proprietaires, biens] = await Promise.all([
    prisma.locataire.findMany({
      select: { id: true, nom: true, prenom: true },
      orderBy: { nom: "asc" },
    }),
    prisma.proprietaire.findMany({
      select: { id: true, nom: true, prenom: true },
      orderBy: { nom: "asc" },
    }),
    prisma.bien.findMany({ select: { id: true, titre: true }, orderBy: { titre: "asc" } }),
  ]);

  const full = (p: { nom: string; prenom: string | null }) =>
    `${p.prenom ? p.prenom + " " : ""}${p.nom}`.trim();

  return (
    <>
      <PageHeader
        title="Messagerie"
        subtitle="Échangez avec vos locataires, propriétaires et prospects"
      />
      <Messagerie
        actor={actor}
        candidates={[
          ...locataires.map((l) => ({ role: "locataire" as const, id: l.id, nom: full(l) })),
          ...proprietaires.map((p) => ({ role: "proprietaire" as const, id: p.id, nom: full(p) })),
        ]}
        biens={biens}
      />
    </>
  );
}
