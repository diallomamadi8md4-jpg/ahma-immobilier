export const COMPARE_KEY = "ahma-comparer";
export const MAX_COMPARE = 4;

export function readCompare(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(COMPARE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

export function writeCompare(ids: number[]): void {
  if (typeof window === "undefined") return;
  const next = ids.slice(0, MAX_COMPARE);
  localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("ahma:comparer", { detail: next }));
}

export function toggleCompare(id: number): number[] {
  const current = readCompare();
  if (current.includes(id)) {
    const next = current.filter((x) => x !== id);
    writeCompare(next);
    return next;
  }
  if (current.length >= MAX_COMPARE) return current;
  const next = [...current, id];
  writeCompare(next);
  return next;
}
