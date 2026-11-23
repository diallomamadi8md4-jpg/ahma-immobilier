import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  compact = false,
  onDark = false,
}: {
  className?: string;
  compact?: boolean;
  onDark?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-soft">
        <Building2 className="h-5 w-5 text-white" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gold-gradient ring-2 ring-white dark:ring-[#0a1513]" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-lg font-extrabold tracking-tight",
              onDark ? "text-white" : "text-ink-900 dark:text-white"
            )}
          >
            Ahma
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
            Immobilier
          </span>
        </span>
      )}
    </span>
  );
}
