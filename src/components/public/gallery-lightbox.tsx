"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, Images } from "lucide-react";
import { PropertyGallery, PropertyImage } from "@/components/ui/property-image";

export function GalleryLightbox({
  accent,
  type,
  titre,
  photos = [],
}: {
  accent: string;
  type: string;
  titre: string;
  photos?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const count = photos.length;

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close, prev, next]);

  if (count === 0) {
    return <PropertyGallery accent={accent} type={type} photos={[]} />;
  }

  return (
    <div className="relative">
      <PropertyGallery accent={accent} type={type} photos={photos} />
      <button
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-ink-900/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-ink-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        aria-label={`Agrandir la galerie (${count} photo${count > 1 ? "s" : ""})`}
      >
        <Maximize2 className="h-3.5 w-3.5" /> Agrandir · {count}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galerie photo — ${titre}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/90 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <button
            ref={closeRef}
            onClick={close}
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Fermer la galerie"
          >
            <X className="h-5 w-5" />
          </button>
          {count > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
                aria-label="Photo suivante"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-video overflow-hidden rounded-2xl bg-ink-900 shadow-2xl">
              <PropertyImage accent={accent} type={type} variant={index} src={photos[index]} alt={`${titre} — photo ${index + 1}`} className="h-full w-full" />
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <p className="text-sm font-medium text-white" aria-live="polite">
                {titre} · {index + 1}/{count}
              </p>
              {count > 1 && (
                <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
                  {photos.map((p, i) => (
                    <button
                      key={`${p}-${i}`}
                      onClick={() => setIndex(i)}
                      className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === index ? "border-gold-400" : "border-transparent opacity-60 hover:opacity-100"}`}
                      aria-label={`Voir la photo ${i + 1}`}
                      aria-current={i === index}
                    >
                      <PropertyImage accent={accent} type={type} variant={i} src={p} className="h-full w-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
