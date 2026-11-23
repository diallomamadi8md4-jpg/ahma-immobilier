import prisma from "@/lib/prisma";
import { CompareView } from "@/components/public/compare-view";
import { parseArray } from "@/lib/utils";

export const revalidate = 0;

export const metadata = {
  title: "Comparateur de biens",
  description: "Comparez jusqu'à 4 biens immobiliers à Abidjan : prix, surface, quartier et équipements.",
};

export default async function ComparerPage() {
  const biens = await prisma.bien.findMany({ orderBy: { createdAt: "desc" } });
  const items = biens.map((b) => ({
    id: b.id,
    titre: b.titre,
    type: b.type,
    statut: b.statut,
    quartier: b.quartier,
    superficie: b.superficie,
    nbChambres: b.nbChambres,
    nbSallesDeBain: b.nbSallesDeBain,
    loyer: b.loyer,
    prixVente: b.prixVente,
    accent: b.accent,
    photos: parseArray(b.photos),
    description: b.description ?? "",
    equipements: parseArray(b.equipements),
  }));

  return <CompareView items={items} />;
}
