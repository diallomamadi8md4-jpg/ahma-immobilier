import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
  dot,
  dotClass,
}: {
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
  dotClass?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} />}
      {children}
    </span>
  );
}
