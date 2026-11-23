"use client";

import { useEffect, useState } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";

export function ShareBar({ titre }: { titre: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  function copy() {
    if (!url) return;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const waText = encodeURIComponent(`${titre} — Ahma Immobilier : ${url}`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-400">Partager</span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-xl border border-surface bg-surface px-3 py-2 text-sm font-medium text-ink-600 transition hover:text-brand-700 dark:text-ink-200"
      >
        {copied ? <Check className="h-4 w-4 text-brand-500" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copié" : "Copier le lien"}
      </button>
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-xl border border-surface bg-surface px-3 py-2 text-sm font-medium text-ink-600 transition hover:text-brand-700 dark:text-ink-200"
      >
        <MessageCircle className="h-4 w-4" /> WhatsApp
      </a>
    </div>
  );
}
