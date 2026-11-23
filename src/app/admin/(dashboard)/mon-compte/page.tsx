import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { MonCompteForm } from "@/components/admin/mon-compte-form";

export const dynamic = "force-dynamic";

export default async function MonComptePage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const admin = await prisma.admin.findUnique({
    where: { id: session.id },
    select: { id: true, nom: true, email: true, poste: true, createdAt: true },
  });
  if (!admin) redirect("/admin/login");

  return (
    <>
      <PageHeader title="Mon compte" subtitle="Gérez vos informations personnelles et votre mot de passe.">
        <LinkButton href="/admin/comptes" variant="outline" size="sm">
          <Users className="h-4 w-4" /> Tous les comptes
        </LinkButton>
      </PageHeader>
      <MonCompteForm admin={{ ...admin, createdAt: admin.createdAt.toISOString() }} />
    </>
  );
}
