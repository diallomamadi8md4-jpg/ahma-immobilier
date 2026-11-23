import prisma from "@/lib/prisma";
import { Estimateur } from "@/components/public/estimateur";

export const revalidate = 0;

export const metadata = {
  title: "Estimer un loyer ou un prix",
  description: "Estimez le loyer ou le prix de vente de votre bien à Abidjan à partir des données du marché Ahma Immobilier.",
};

type Stat = {
  quartier: string;
  type: string;
  locationRate: number | null;
  saleRate: number | null;
  count: number;
};

export default async function EstimerPage() {
  const biens = await prisma.bien.findMany({
    select: { type: true, quartier: true, superficie: true, loyer: true, prixVente: true },
  });

  const groups = new Map<string, { loc: number[]; vente: number[] }>();
  for (const b of biens) {
    if (b.superficie <= 0) continue;
    const key = `${b.quartier}||${b.type}`;
    const g = groups.get(key) ?? { loc: [], vente: [] };
    if (b.loyer) g.loc.push(b.loyer / b.superficie);
    if (b.prixVente) g.vente.push(b.prixVente / b.superficie);
    groups.set(key, g);
  }

  const avg = (values: number[]) =>
    values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;

  const stats: Stat[] = Array.from(groups, ([key, g]) => {
    const [quartier, type] = key.split("||");
    return {
      quartier,
      type,
      locationRate: avg(g.loc),
      saleRate: avg(g.vente),
      count: g.loc.length + g.vente.length,
    };
  });

  const globalLoc = avg(biens.filter((b) => b.loyer && b.superficie > 0).map((b) => (b.loyer ?? 0) / b.superficie));
  const globalVente = avg(biens.filter((b) => b.prixVente && b.superficie > 0).map((b) => (b.prixVente ?? 0) / b.superficie));

  return (
    <Estimateur
      stats={stats}
      quartiers={Array.from(new Set(biens.map((b) => b.quartier))).sort()}
      types={Array.from(new Set(biens.map((b) => b.type))).sort()}
      globalLoc={globalLoc ?? 0}
      globalVente={globalVente ?? 0}
      sample={biens.length}
    />
  );
}
