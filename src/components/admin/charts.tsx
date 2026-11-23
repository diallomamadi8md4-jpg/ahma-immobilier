"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BRAND = "#10b981";
const BRAND_DARK = "#047857";
const GOLD = "#f59e0b";
const INK = "#9db3af";

function tooltipStyle() {
  return {
    contentStyle: {
      borderRadius: 12,
      border: "1px solid var(--border)",
      background: "var(--surface)",
      boxShadow: "0 8px 24px rgba(15,31,28,0.12)",
      fontSize: 12,
      padding: "8px 12px",
    },
    labelStyle: { color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 },
    itemStyle: { color: "var(--text)" },
  };
}

export function RevenueAreaChart({
  data,
}: {
  data: { mois: string; revenu: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND} stopOpacity={0.35} />
            <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="mois"
          tick={{ fontSize: 11, fill: INK }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: INK }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}M` : `${Math.round(v / 1000)}k`)}
          width={48}
        />
        <Tooltip
          {...tooltipStyle()}
          formatter={(value) => [formatFCFAInline(Number(value)), "Encaissé"]}
        />
        <Area
          type="monotone"
          dataKey="revenu"
          stroke={BRAND}
          strokeWidth={2.5}
          fill="url(#rev)"
          dot={{ r: 3, fill: BRAND, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: BRAND_DARK }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OccupancyDonut({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={88}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            {...tooltipStyle()}
            formatter={(value, name) => [`${value} bien(s)`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-bold text-ink-900 dark:text-white">
          {total > 0 ? Math.round(((data.find((d) => d.name === "Loués")?.value ?? 0) / total) * 100) : 0}%
        </span>
        <span className="text-xs text-ink-400">Occupation</span>
      </div>
    </div>
  );
}

export function MethodBarChart({
  data,
}: {
  data: { methode: string; montant: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <XAxis dataKey="methode" tick={{ fontSize: 11, fill: INK }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: INK }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}M` : `${Math.round(v / 1000)}k`)}
          width={48}
        />
        <Tooltip
          {...tooltipStyle()}
          cursor={{ fill: "rgba(16,185,129,0.06)" }}
          formatter={(value) => [formatFCFAInline(Number(value)), "Encaissé"]}
        />
        <Bar dataKey="montant" radius={[8, 8, 0, 0]} maxBarSize={56}>
          {data.map((_, i) => (
            <Cell key={i} fill={i % 2 === 0 ? BRAND : GOLD} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function formatFCFAInline(n: number): string {
  return (
    new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 })
      .format(n)
      .replace(/\u00A0/g, " ") + " FCFA"
  );
}
