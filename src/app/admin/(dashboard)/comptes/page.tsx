import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/admin/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { AdminComptes } from "@/components/admin/admin-comptes";

export const dynamic = "force-dynamic";

export default async function ComptesAdminPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const admins = await prisma.admin.findMany({
    select: { id: true, nom: true, email: true, createdAt: true },
    orderBy: { id: "asc" },
  });

  return (
    <>
      <PageHeader
        title="Comptes administrateurs"
        subtitle="Créez, modifiez et supprimez les accès à l'espace d'administration."
      >
        <LinkButton href="/admin/mon-compte" variant="outline" size="sm">
          <ShieldCheck className="h-4 w-4" /> Mon compte
        </LinkButton>
      </PageHeader>
      <AdminComptes
        admins={admins.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
        currentId={session.id}
      />
    </>
  );
}
