"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const KEY = "ahma-favoris";

function readIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function FavoriteButton({ id, className }: { id: number; className?: string }) {
  const [fav, setFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFav(readIds().includes(id));
  }, [id]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const list = readIds();
    let next: number[];
    if (list.includes(id)) {
      next = list.filter((x) => x !== id);
      setFav(false);
    } else {
      next = [...list, id];
      setFav(true);
    }
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("ahma:favoris"));
  }

  return (
    <button
      onClick={toggle}
      aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-600 shadow-soft backdrop-blur transition hover:scale-110 dark:bg-ink-900/80 dark:text-ink-100",
        className
      )}
    >
      {mounted && fav ? (
        <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
      ) : (
        <Heart className="h-4 w-4" />
      )}
    </button>
  );
}
