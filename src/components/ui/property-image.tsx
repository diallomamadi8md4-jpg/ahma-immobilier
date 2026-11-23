"use client";

import { useId, useState } from "react";
import { Home, Building2, Briefcase, MapPin, Store } from "lucide-react";
import { ACCENT_GRADIENT, cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  villa: Home,
  appartement: Building2,
  bureau: Briefcase,
  terrain: MapPin,
  commerce: Store,
  magasin: Store,
};

const OVERLAYS = [
  { angle: "135deg", tint: "rgba(255,255,255,0.06)" },
  { angle: "210deg", tint: "rgba(0,0,0,0.10)" },
  { angle: "160deg", tint: "rgba(255,255,255,0.12)" },
  { angle: "200deg", tint: "rgba(0,0,0,0.06)" },
  { angle: "125deg", tint: "rgba(255,255,255,0.04)" },
  { angle: "180deg", tint: "rgba(0,0,0,0.14)" },
];

export function PropertyImage({
  accent = "emerald",
  type = "villa",
  className,
  variant = 0,
  rounded = true,
  src,
  alt,
}: {
  accent?: string;
  type?: string;
  className?: string;
  variant?: number;
  rounded?: boolean;
  src?: string;
  alt?: string;
}) {
  const base = ACCENT_GRADIENT[accent] ?? ACCENT_GRADIENT.emerald;
  const overlay = OVERLAYS[variant % OVERLAYS.length];
  const Icon = ICONS[type] ?? Home;
  const [imgOk, setImgOk] = useState(true);
  const showImg = Boolean(src) && imgOk;
  const patternId = `ahma-pattern-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden",
        rounded && "rounded-2xl",
        className
      )}
      style={{ backgroundImage: base }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${overlay.angle}, ${overlay.tint}, transparent 60%)`,
        }}
      />
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-6 h-36 w-36 rounded-full bg-white/5 blur-2xl" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden="true">
        <defs>
          <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 24 L24 0" stroke="white" strokeWidth="1" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {showImg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500"
          onError={() => setImgOk(false)}
        />
      )}

      {!showImg && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <Icon className="h-8 w-8 text-white/90" />
          </div>
        </div>
      )}
    </div>
  );
}

/** Galerie : 1 grande photo + 3 vignettes (remplacées par des dégradés si absentes) */
export function PropertyGallery({
  accent,
  type,
  photos = [],
}: {
  accent: string;
  type: string;
  photos?: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-[minmax(150px,1fr)_minmax(150px,1fr)]">
      <div className="col-span-2 row-span-2">
        <PropertyImage accent={accent} type={type} variant={0} src={photos[0]} alt="Photo principale du bien" className="min-h-[240px] sm:min-h-[320px]" />
      </div>
      <div>
        <PropertyImage accent={accent} type={type} variant={1} src={photos[1]} alt="Deuxième photo du bien" className="min-h-[130px]" />
      </div>
      <div>
        <PropertyImage accent={accent} type={type} variant={2} src={photos[2]} alt="Troisième photo du bien" className="min-h-[130px]" />
      </div>
      <div className="col-span-2">
        <PropertyImage accent={accent} type={type} variant={3} src={photos[3] ?? photos[1]} alt="Vue supplémentaire du bien" className="min-h-[130px]" />
      </div>
    </div>
  );
}
