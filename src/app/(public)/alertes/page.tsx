import Link from "next/link";
import { BellRing } from "lucide-react";
import { AlertesView } from "@/components/public/alertes-view";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Mes alertes immobilier",
  description: "Retrouvez vos recherches enregistrées et les nouveaux biens correspondant à vos critères.",
};

export default function AlertesPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-surface bg-brand-gradient text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(245,158,11,0.14),transparent_45%)]" />
        <div className="container relative py-12">
          <nav className="text-xs text-white/60">
            <Link href="/" className="hover:text-white">Accueil</Link> <span className="mx-1">/</span> Mes alertes
          </nav>
          <h1 className="section-title mt-3 flex items-center gap-3 text-3xl font-semibold sm:text-4xl">
            <BellRing className="h-8 w-8 text-gold-300" /> Mes alertes
          </h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Les nouveaux biens qui correspondent à vos recherches, au même endroit que vos critères.
          </p>
          <div className="gold-rule mt-5" />
        </div>
      </section>

      <section className="container py-10">
        <AlertesView tokenFromUrl={searchParams.token} />
      </section>
    </>
  );
}
