import { ArrowLeft, Save } from "lucide-react";
import { createLocataireAction } from "@/actions";
import { PageHeader } from "@/components/admin/page-header";
import { Field } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function NouveauLocatairePage() {
  return (
    <>
      <PageHeader title="Nouveau locataire" subtitle="Ajoutez un locataire au CRM">
        <LinkButton href="/admin/locataires" variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Retour</LinkButton>
      </PageHeader>

      <form action={createLocataireAction} className="card mx-auto max-w-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom *"><input name="nom" required placeholder="Brou" className="input-base" /></Field>
          <Field label="Prénom"><input name="prenom" placeholder="Koffi" className="input-base" /></Field>
          <Field label="Email"><input name="email" type="email" placeholder="email@..." className="input-base" /></Field>
          <Field label="Téléphone"><input name="telephone" placeholder="+225 ..." className="input-base" /></Field>
          <Field label="Profession"><input name="profession" placeholder="Cadre" className="input-base" /></Field>
          <Field label="Adresse"><input name="adresse" placeholder="Cocody, Abidjan" className="input-base" /></Field>
          <Field label="Type de pièce">
            <select name="typePiece" className="input-base">
              <option value="CNI">Carte nationale d&apos;identité</option>
              <option value="Passeport">Passeport</option>
            </select>
          </Field>
          <Field label="Numéro de pièce"><input name="numeroPiece" placeholder="CI225019874" className="input-base" /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <LinkButton href="/admin/locataires" variant="ghost">Annuler</LinkButton>
          <Button type="submit"><Save className="h-4 w-4" /> Enregistrer</Button>
        </div>
      </form>
    </>
  );
}
