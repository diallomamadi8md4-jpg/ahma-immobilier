import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

const ACCENTS: Record<string, string> = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400",
  gold: "bg-gold-50 text-gold-600 dark:bg-gold-500/15 dark:text-gold-400",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
};

const ACCENT_BARS: Record<string, string> = {
  brand: "bg-brand-500",
  gold: "bg-gold-500",
  sky: "bg-sky-500",
  rose: "bg-rose-500",
};

export function StatCard({
  label,
  value,
  format,
  sub,
  icon: Icon,
  accent = "brand",
  trend,
  trendLabel,
}: {
  label: string;
  value: number;
  format: "fcfa" | "percent" | "count";
  sub?: string;
  icon: LucideIcon;
  accent?: keyof typeof ACCENTS;
  trend?: "up" | "down";
  trendLabel?: string;
}) {
  return (
    <div className="card card-interactive relative overflow-hidden p-5 animate-fade-in">
      <span className={cn("absolute inset-x-0 top-0 h-0.5", ACCENT_BARS[accent])} aria-hidden="true" />
      <div className="flex items-start justify-between">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", ACCENTS[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
              trend === "up"
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
            )}
          >
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {trendLabel}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-ink-500 dark:text-ink-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
        <AnimatedNumber value={value} format={format} />
      </p>
      {sub && <p className="mt-1 text-xs text-ink-400">{sub}</p>}
    </div>
  );
}
