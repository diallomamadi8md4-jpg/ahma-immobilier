import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatte un montant en FCFA : 1500000 -> "1 500 000 FCFA" */
export function formatFCFA(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  })
    .format(n)
    .replace(/\u00A0/g, " ") + " FCFA";
}

/** Version compacte : 1500000 -> "1,5 M FCFA" */
export function formatFCFACompact(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) {
    return (n / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " M FCFA";
  }
  if (n >= 1_000) {
    return Math.round(n / 1_000) + " k FCFA";
  }
  return n + " FCFA";
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("fr-FR").format(n);
}

const MOIS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];
const MOIS_LONG = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return `${date.getDate()} ${MOIS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateLong(d: Date | string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "—";
  return `${date.getDate()} ${MOIS_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

export function monthLabel(key: string): string {
  // key = "2024-03" -> "mars 2024"
  const [y, m] = key.split("-");
  const idx = Number(m) - 1;
  if (idx < 0 || idx > 11) return key;
  return `${MOIS_LONG[idx]} ${y}`;
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function parseArray(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function initials(nom: string, prenom?: string | null): string {
  const a = (nom?.[0] ?? "").toUpperCase();
  const b = (prenom?.[0] ?? "").toUpperCase();
  return (a + b) || "?";
}

export type BienStatut = "disponible" | "loue" | "reserve" | "maintenance";
export type PaiementStatut = "paye" | "en_attente" | "retard";
export type ContratStatut = "actif" | "a_venir" | "expire" | "resilie";
export type BienType = "villa" | "appartement" | "bureau" | "terrain" | "commerce" | "magasin";
export type Methode = "especes" | "virement" | "mobile_money" | "chequier";

export const BIEN_TYPE_LABEL: Record<string, string> = {
  villa: "Villa",
  appartement: "Appartement",
  bureau: "Bureau",
  terrain: "Terrain",
  commerce: "Local commercial",
  magasin: "Magasin",
};

export const BIEN_STATUT_META: Record<string, { label: string; cls: string; dot: string }> = {
  disponible: { label: "Disponible", cls: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300", dot: "bg-brand-500" },
  loue: { label: "Loué", cls: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300", dot: "bg-sky-500" },
  reserve: { label: "Réservé", cls: "bg-gold-50 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300", dot: "bg-gold-500" },
  maintenance: { label: "En maintenance", cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", dot: "bg-rose-500" },
};

export const PAIEMENT_STATUT_META: Record<string, { label: string; cls: string; dot: string }> = {
  paye: { label: "Payé", cls: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300", dot: "bg-brand-500" },
  en_attente: { label: "En attente", cls: "bg-gold-50 text-gold-700 dark:bg-gold-500/15 dark:text-gold-300", dot: "bg-gold-500" },
  retard: { label: "En retard", cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", dot: "bg-rose-500" },
};

export const CONTRAT_STATUT_META: Record<string, { label: string; cls: string; dot: string }> = {
  actif: { label: "Actif", cls: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300", dot: "bg-brand-500" },
  a_venir: { label: "À venir", cls: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300", dot: "bg-sky-500" },
  expire: { label: "Expiré", cls: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300", dot: "bg-ink-400" },
  resilie: { label: "Résilié", cls: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300", dot: "bg-rose-500" },
};

export const METHODE_LABEL: Record<string, string> = {
  especes: "Espèces",
  virement: "Virement bancaire",
  mobile_money: "Mobile Money",
  chequier: "Chèque",
};

export const ACCENT_GRADIENT: Record<string, string> = {
  emerald: "linear-gradient(135deg, #047857 0%, #022c22 60%, #064e3b 100%)",
  gold: "linear-gradient(135deg, #b45309 0%, #78350f 60%, #92400e 100%)",
  teal: "linear-gradient(135deg, #0f766e 0%, #042f2e 60%, #115e59 100%)",
  sky: "linear-gradient(135deg, #0369a1 0%, #082f49 60%, #0c4a6e 100%)",
  rose: "linear-gradient(135deg, #be123c 0%, #4c0519 60%, #881337 100%)",
  violet: "linear-gradient(135deg, #6d28d9 0%, #2e1065 60%, #4c1d95 100%)",
  amber: "linear-gradient(135deg, #b45309 0%, #451a03 60%, #78350f 100%)",
  cyan: "linear-gradient(135deg, #0e7490 0%, #083344 60%, #155e75 100%)",
};
