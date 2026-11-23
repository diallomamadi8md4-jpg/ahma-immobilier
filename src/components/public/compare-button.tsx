"use client";

import { useEffect, useState } from "react";
import { GitCompareArrows, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { readCompare, toggleCompare } from "@/lib/compare";

export function CompareButton({ id, className }: { id: number; className?: string }) {
  const [selected, setSelected] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const update = () => {
      const ids = readCompare();
      setSelected(ids.includes(id));
      setFull(ids.length >= 4 && !ids.includes(id));
    };
    update();
    window.addEventListener("ahma:comparer", update);
    return () => window.removeEventListener("ahma:comparer", update);
  }, [id]);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleCompare(id);
    setSelected(next.includes(id));
    setFull(next.length >= 4 && !next.includes(id));
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={full}
      aria-pressed={selected}
      title={selected ? "Retirer du comparateur" : full ? "Maximum 4 biens" : "Ajouter au comparateur"}
      aria-label={selected ? "Retirer du comparateur" : "Ajouter au comparateur"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-600 shadow-soft backdrop-blur transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-ink-900/80 dark:text-ink-100",
        selected && "bg-brand-600 text-white dark:bg-brand-600 dark:text-white",
        className
      )}
    >
      {selected ? <Check className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
    </button>
  );
}
