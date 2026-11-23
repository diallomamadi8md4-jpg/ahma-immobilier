/** Critères de recherche partagés entre le catalogue, les recherches sauvegardées et les alertes. */

export interface SearchCriteria {
  q: string;
  type: string;
  statut: string;
  quartier: string;
  loyerMax: number;
  surfaceMin: number;
  chambres: number;
  tri: string;
}

export type SearchBien = {
  titre: string;
  type: string;
  statut: string;
  quartier: string;
  adresse?: string | null;
  description?: string | null;
  superficie: number;
  nbChambres?: number | null;
  loyer?: number | null;
  prixVente?: number | null;
  createdAt?: Date;
};

export const EMPTY_CRITERIA: SearchCriteria = {
  q: "",
  type: "",
  statut: "",
  quartier: "",
  loyerMax: 0,
  surfaceMin: 0,
  chambres: 0,
  tri: "recent",
};

function asString(value: unknown): string {
  if (Array.isArray(value)) return asString(value[0]);
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function asNumber(value: unknown): number {
  const n = Number(asString(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Accepte les searchParams de Next.js, une chaîne JSON (base de données) ou un objet simple. */
export function parseCriteria(
  input: Record<string, unknown> | string | URLSearchParams | null | undefined
): SearchCriteria {
  let raw: Record<string, unknown> = {};
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (parsed && typeof parsed === "object") raw = parsed as Record<string, unknown>;
    } catch {
      raw = {};
    }
  } else if (input instanceof URLSearchParams) {
    raw = Object.fromEntries(input.entries());
  } else if (input) {
    raw = input;
  }

  return {
    q: asString(raw.q).toLowerCase().trim().slice(0, 120),
    type: asString(raw.type),
    statut: asString(raw.statut),
    quartier: asString(raw.quartier),
    loyerMax: asNumber(raw.loyerMax),
    surfaceMin: asNumber(raw.surfaceMin),
    chambres: asNumber(raw.chambres),
    tri: asString(raw.tri) || "recent",
  };
}

export function criteriaToQuery(c: SearchCriteria): string {
  const p = new URLSearchParams();
  if (c.q) p.set("q", c.q);
  if (c.type) p.set("type", c.type);
  if (c.statut) p.set("statut", c.statut);
  if (c.quartier) p.set("quartier", c.quartier);
  if (c.loyerMax) p.set("loyerMax", String(c.loyerMax));
  if (c.surfaceMin) p.set("surfaceMin", String(c.surfaceMin));
  if (c.chambres) p.set("chambres", String(c.chambres));
  if (c.tri && c.tri !== "recent") p.set("tri", c.tri);
  const s = p.toString();
  return s ? `/biens?${s}` : "/biens";
}

const TYPE_LABEL: Record<string, string> = {
  villa: "Villa", appartement: "Appartement", bureau: "Bureau",
  terrain: "Terrain", commerce: "Local commercial", magasin: "Magasin",
};
const STATUT_LABEL: Record<string, string> = {
  disponible: "Disponible", loue: "Loué", reserve: "Réservé", maintenance: "En maintenance",
};

export function criteriaLabel(c: SearchCriteria): string {
  const parts: string[] = [];
  if (c.q) parts.push(`« ${c.q} »`);
  if (c.type) parts.push(TYPE_LABEL[c.type] ?? c.type);
  if (c.quartier) parts.push(c.quartier);
  if (c.loyerMax) parts.push(`≤ ${c.loyerMax.toLocaleString("fr-FR")} FCFA/mois`);
  if (c.surfaceMin) parts.push(`≥ ${c.surfaceMin} m²`);
  if (c.chambres) parts.push(`${c.chambres}+ chambres`);
  if (c.statut) parts.push(STATUT_LABEL[c.statut] ?? c.statut);
  return parts.length ? parts.join(" · ") : "Tous les biens du catalogue";
}

/** Une seule source de vérité pour filtrer : utilisée par /biens et par le moteur d'alertes. */
export function matchBien(b: SearchBien, c: SearchCriteria): boolean {
  if (c.q && !`${b.titre} ${b.quartier} ${b.adresse ?? ""} ${b.description ?? ""}`.toLowerCase().includes(c.q)) return false;
  if (c.type && b.type !== c.type) return false;
  if (c.statut && b.statut !== c.statut) return false;
  if (c.quartier && b.quartier !== c.quartier) return false;
  if (c.loyerMax > 0 && (b.loyer == null || b.loyer > c.loyerMax)) return false;
  if (c.surfaceMin > 0 && b.superficie < c.surfaceMin) return false;
  if (c.chambres > 0 && (b.nbChambres ?? 0) < c.chambres) return false;
  return true;
}

export function sortBiens<T extends SearchBien>(items: T[], tri: string): T[] {
  const copy = [...items];
  if (tri === "loyer_asc") copy.sort((a, b) => (a.loyer ?? Infinity) - (b.loyer ?? Infinity));
  if (tri === "loyer_desc") copy.sort((a, b) => (b.loyer ?? -Infinity) - (a.loyer ?? -Infinity));
  if (tri === "surface") copy.sort((a, b) => b.superficie - a.superficie);
  return copy;
}
