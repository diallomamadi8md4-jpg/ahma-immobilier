import { ArrowLeft, Save } from "lucide-react";
import { createProprietaireAction } from "@/actions";
import { PageHeader } from "@/components/admin/page-header";
import { Field } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function NouveauProprietairePage() {
  return (
    <>
      <PageHeader title="Nouveau propriétaire" subtitle="Ajoutez un propriétaire / mandant">
        <LinkButton href="/admin/proprietaires" variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Retour</LinkButton>
      </PageHeader>

      <form action={createProprietaireAction} className="card mx-auto max-w-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type de personne">
            <select name="typePersonne" className="input-base" onChangeCapture={() => {}}>
              <option value="physique">Personne physique</option>
              <option value="morale">Personne morale (société)</option>
            </select>
          </Field>
          <Field label="Nom / Raison sociale *"><input name="nom" required placeholder="Kouassi / SCI Angré" className="input-base" /></Field>
          <Field label="Prénom"><input name="prenom" placeholder="Yves" className="input-base" /></Field>
          <Field label="Société"><input name="societe" placeholder="SCI Angré Invest" className="input-base" /></Field>
          <Field label="Email"><input name="email" type="email" placeholder="email@..." className="input-base" /></Field>
          <Field label="Téléphone"><input name="telephone" placeholder="+225 ..." className="input-base" /></Field>
          <Field label="Adresse"><input name="adresse" placeholder="Cocody, Abidjan" className="input-base" /></Field>
          <Field label="Type de pièce">
            <select name="typePiece" className="input-base">
              <option value="CNI">CNI</option>
              <option value="Passeport">Passeport</option>
              <option value="RCCM">RCCM (société)</option>
            </select>
          </Field>
          <Field label="Numéro de pièce"><input name="numeroPiece" placeholder="CI225019874" className="input-base" /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <LinkButton href="/admin/proprietaires" variant="ghost">Annuler</LinkButton>
          <Button type="submit"><Save className="h-4 w-4" /> Enregistrer</Button>
        </div>
      </form>
    </>
  );
}
