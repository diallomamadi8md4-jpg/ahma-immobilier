"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ahma-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ahma-theme", "light");
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Basculer le thème"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface bg-surface text-ink-600 transition hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800/60",
        className
      )}
    >
      {mounted && dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
