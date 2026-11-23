import { Badge } from "./badge";
import { BIEN_STATUT_META, PAIEMENT_STATUT_META, CONTRAT_STATUT_META } from "@/lib/utils";

type Meta = { label: string; cls: string; dot: string };

const FALLBACK: Meta = { label: "", cls: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300", dot: "bg-ink-400" };

export function StatusBadge({ meta }: { meta: Meta }) {
  return (
    <Badge className={meta.cls} dot dotClass={meta.dot}>
      {meta.label}
    </Badge>
  );
}

export function StatutBien({ statut }: { statut: string }) {
  return <StatusBadge meta={BIEN_STATUT_META[statut] ?? FALLBACK} />;
}

export function StatutPaiement({ statut }: { statut: string }) {
  return <StatusBadge meta={PAIEMENT_STATUT_META[statut] ?? FALLBACK} />;
}

export function StatutContrat({ statut }: { statut: string }) {
  return <StatusBadge meta={CONTRAT_STATUT_META[statut] ?? FALLBACK} />;
}
