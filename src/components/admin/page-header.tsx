import * as React from "react";

export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="section-title text-2xl font-semibold text-ink-900 dark:text-white">{title}</h1>
        <div className="gold-rule mt-2" />
        {subtitle && <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}
