"use client";

import { useEffect, useRef, useState } from "react";
import { formatFCFA, formatNumber } from "@/lib/utils";

export function AnimatedNumber({
  value,
  format,
  duration = 1000,
}: {
  value: number;
  format: "fcfa" | "percent" | "count";
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | undefined>(undefined);
  const startTs = useRef<number | undefined>(undefined);

  useEffect(() => {
    startTs.current = undefined;
    const step = (t: number) => {
      if (startTs.current == null) startTs.current = t;
      const p = Math.min((t - startTs.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf.current = requestAnimationFrame(step);
      else setDisplay(value);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  if (format === "fcfa") return <>{formatFCFA(Math.round(display))}</>;
  if (format === "percent") return <>{Math.round(display)}%</>;
  return <>{formatNumber(Math.round(display))}</>;
}
