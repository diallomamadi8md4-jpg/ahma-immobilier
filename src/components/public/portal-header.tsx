import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { PortailLogout } from "@/components/public/portail-logout";

export function PortalHeader({
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel = "Mon espace",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  backHref?: string;
  backLabel?: string;
}) {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#06251f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.22),transparent_45%),radial-gradient(circle_at_90%_100%,rgba(245,158,11,0.12),transparent_40%)]" />
      <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/5" />
      <div className="pointer-events-none absolute -right-6 -top-14 h-72 w-72 rounded-full border border-white/5" />
      <div className="container relative flex flex-wrap items-end justify-between gap-6 py-10">
        <div>
          {backHref && (
            <Link
              href={backHref}
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/60 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
            </Link>
          )}
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-300">{eyebrow}</p>
          <h1 className="section-title mt-2 text-3xl font-semibold sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/70">{subtitle}</p>
          <p className="mt-4 flex items-center gap-1.5 text-[11px] text-white/45">
            <CalendarDays className="h-3.5 w-3.5" /> {today}
          </p>
        </div>
        <PortailLogout />
      </div>
      <div className="gold-rule absolute bottom-0 left-0" />
    </section>
  );
}
