"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GitCompareArrows, X, ArrowRight } from "lucide-react";
import { readCompare, writeCompare } from "@/lib/compare";
import { buttonVariants } from "@/components/ui/button";

export function CompareBar() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const update = () => setIds(readCompare());
    update();
    window.addEventListener("ahma:comparer", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("ahma:comparer", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  if (ids.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/95 p-3 text-white shadow-2xl backdrop-blur">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-gradient">
          <GitCompareArrows className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{ids.length} bien{ids.length > 1 ? "s" : ""} à comparer</p>
          <p className="truncate text-xs text-white/60">Ajoutez-en jusqu&apos;à 4 pour les comparer côte à côte.</p>
        </div>
        <Link href="/comparer" className={buttonVariants({ variant: "gold", size: "sm" })}>
          Comparer <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          type="button"
          onClick={() => writeCompare([])}
          aria-label="Vider le comparateur"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
