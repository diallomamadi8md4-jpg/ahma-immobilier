import Link from "next/link";
import prisma from "@/lib/prisma";
import { BienMap } from "@/components/public/bien-map";
import { parseArray } from "@/lib/utils";

export const revalidate = 0;

export const metadata = {
  title: "Carte des biens",
  description: "Explorez les biens Ahma Immobilier quartier par quartier à Abidjan.",
};

export default async function CartePage() {
  const biens = await prisma.bien.findMany({ orderBy: { createdAt: "desc" } });
  const items = biens.map((b) => ({
    id: b.id,
    titre: b.titre,
    type: b.type,
    statut: b.statut,
    quartier: b.quartier,
    superficie: b.superficie,
    loyer: b.loyer,
    prixVente: b.prixVente,
    accent: b.accent,
    photos: parseArray(b.photos),
  }));

  return (
    <>
      <section className="border-b border-surface bg-brand-gradient text-white">
        <div className="container py-12">
          <nav className="text-xs text-white/60">
            <Link href="/" className="hover:text-white">Accueil</Link> <span className="mx-1">/</span> Carte
          </nav>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Nos biens sur la carte</h1>
          <p className="mt-2 max-w-xl text-white/80">
            Explorez Abidjan quartier par quartier et découvrez les biens disponibles, loués ou réservés.
          </p>
        </div>
      </section>

      <section className="container py-10">
        <BienMap biens={items} />
      </section>
    </>
  );
}
