"use client";

import { useTransition } from "react";
import { updateBienStatutAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const OPTIONS = [
  { value: "disponible", label: "Disponible" },
  { value: "loue", label: "Loué" },
  { value: "reserve", label: "Réservé" },
  { value: "maintenance", label: "En maintenance" },
];

export function BienStatutForm({ bienId, statut }: { bienId: number; statut: string }) {
  const [pending, start] = useTransition();
  return (
    <form
      action={(formData) => start(() => updateBienStatutAction(bienId, String(formData.get("statut"))))}
      className="flex items-center gap-2"
    >
      <select name="statut" defaultValue={statut} className="input-base flex-1">
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Enregistrer
      </Button>
    </form>
  );
}
