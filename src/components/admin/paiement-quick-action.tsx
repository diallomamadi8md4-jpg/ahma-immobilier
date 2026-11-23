"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { updatePaiementStatutAction } from "@/actions";
import { Button } from "@/components/ui/button";

export function PaiementPayeButton({ id }: { id: number }) {
  const [pending, start] = useTransition();
  return (
    <form action={() => start(() => updatePaiementStatutAction(id, "paye"))}>
      <Button type="submit" size="sm" variant="subtle" disabled={pending}>
        <Check className="h-3.5 w-3.5" /> {pending ? "…" : "Encaisser"}
      </Button>
    </form>
  );
}
