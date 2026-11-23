import { ArrowLeft, Save } from "lucide-react";
import prisma from "@/lib/prisma";
import { createContratAction } from "@/actions";
import { PageHeader } from "@/components/admin/page-header";
import { Field } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NouveauContratPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const [biens, locataires] = await Promise.all([
    prisma.bien.findMany({ orderBy: { titre: "asc" } }),
    prisma.locataire.findMany({ orderBy: { nom: "asc" } }),
  ]);
  const preBienId = String(searchParams.bienId ?? "");
  const today = new Date().toISOString().slice(0, 10);
  const dansUnAn = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10);

  return (
    <>
      <PageHeader title="Nouveau contrat de bail" subtitle="Liez un bien à un locataire">
        <LinkButton href="/admin/contrats" variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Retour</LinkButton>
      </PageHeader>

      <form action={createContratAction} className="card mx-auto max-w-3xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bien *" className="sm:col-span-2">
            <select name="bienId" required defaultValue={preBienId} className="input-base">
              <option value="">— Sélectionner —</option>
              {biens.map((b) => (
                <option key={b.id} value={b.id}>{b.titre} · {b.quartier}</option>
              ))}
            </select>
          </Field>
          <Field label="Locataire *" className="sm:col-span-2">
            <select name="locataireId" required className="input-base">
              <option value="">— Sélectionner —</option>
              {locataires.map((l) => (
                <option key={l.id} value={l.id}>{l.nom}{l.prenom ? " " + l.prenom : ""}</option>
              ))}
            </select>
          </Field>
          <Field label="Date de début *"><input name="dateDebut" type="date" required defaultValue={today} className="input-base" /></Field>
          <Field label="Date de fin *"><input name="dateFin" type="date" required defaultValue={dansUnAn} className="input-base" /></Field>
          <Field label="Loyer mensuel (FCFA) *"><input name="loyerMensuel" type="number" min="0" required placeholder="900000" className="input-base" /></Field>
          <Field label="Caution (FCFA)"><input name="caution" type="number" min="0" placeholder="1800000" className="input-base" /></Field>
          <Field label="Fréquence">
            <select name="frequence" className="input-base">
              <option value="mensuel">Mensuel</option>
              <option value="trimestriel">Trimestriel</option>
              <option value="annuel">Annuel</option>
            </select>
          </Field>
          <Field label="Statut">
            <select name="statut" className="input-base">
              <option value="actif">Actif</option>
              <option value="a_venir">À venir</option>
              <option value="resilie">Résilié</option>
            </select>
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <textarea name="notes" rows={3} placeholder="Conditions particulières…" className="input-base resize-none" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <LinkButton href="/admin/contrats" variant="ghost">Annuler</LinkButton>
          <Button type="submit"><Save className="h-4 w-4" /> Créer le contrat</Button>
        </div>
      </form>
    </>
  );
}
