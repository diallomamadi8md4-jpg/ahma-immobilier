import Link from "next/link";
import { Home, Building2 } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LinkButton } from "@/components/ui/link-button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-gradient px-6 text-center text-white">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="relative max-w-md">
        <div className="mx-auto mb-6 w-fit"><Logo onDark /></div>
        <div className="font-display text-7xl font-extrabold tracking-tight">404</div>
        <h1 className="mt-4 font-display text-2xl font-bold">Page introuvable</h1>
        <p className="mt-2 text-white/70">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/" variant="gold">
            <Home className="h-4 w-4" /> Accueil
          </LinkButton>
          <LinkButton href="/biens" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
            <Building2 className="h-4 w-4" /> Nos biens
          </LinkButton>
        </div>
        <p className="mt-10 text-xs text-white/40">© {new Date().getFullYear()} Ahma Immobilier — Abidjan</p>
      </div>
    </div>
  );
}
