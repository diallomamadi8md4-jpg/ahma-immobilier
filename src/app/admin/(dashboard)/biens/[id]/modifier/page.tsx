import { ArrowLeft, Save } from "lucide-react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { updateBienAction } from "@/actions";
import { PageHeader } from "@/components/admin/page-header";
import { Field } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import { parseArray } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPES = [
  ["villa", "Villa"], ["appartement", "Appartement"], ["bureau", "Bureau"],
  ["terrain", "Terrain"], ["commerce", "Local commercial"], ["magasin", "Magasin"],
];
const STATUTS = [
  ["disponible", "Disponible"], ["loue", "Loué"], ["reserve", "Réservé"], ["maintenance", "En maintenance"],
];
const ACCENTS = [
  ["emerald", "Émeraude"], ["gold", "Or"], ["teal", "Sarcelle"], ["sky", "Bleu ciel"],
  ["rose", "Rose"], ["violet", "Violet"], ["amber", "Ambre"], ["cyan", "Cyan"],
];

export default async function ModifierBienPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const [bien, proprietaires] = await Promise.all([
    prisma.bien.findUnique({ where: { id } }),
    prisma.proprietaire.findMany({ orderBy: { nom: "asc" } }),
  ]);
  if (!bien) notFound();

  return (
    <>
      <PageHeader title={`Modifier : ${bien.titre}`} subtitle="Mettez à jour les informations et le statut du bien">
        <LinkButton href={`/admin/biens/${id}`} variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Retour à la fiche</LinkButton>
      </PageHeader>

      <form action={updateBienAction} className="card mx-auto max-w-3xl p-6">
        <input type="hidden" name="id" value={bien.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titre du bien *" className="sm:col-span-2">
            <input name="titre" required defaultValue={bien.titre} className="input-base" />
          </Field>
          <Field label="Type *">
            <select name="type" defaultValue={bien.type} className="input-base">{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </Field>
          <Field label="Statut">
            <select name="statut" defaultValue={bien.statut} className="input-base">{STATUTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </Field>
          <Field label="Quartier *">
            <input name="quartier" required defaultValue={bien.quartier} className="input-base" />
          </Field>
          <Field label="Adresse">
            <input name="adresse" defaultValue={bien.adresse ?? ""} className="input-base" />
          </Field>
          <Field label="Superficie (m²) *">
            <input name="superficie" type="number" min="0" required defaultValue={bien.superficie} className="input-base" />
          </Field>
          <Field label="Chambres">
            <input name="nbChambres" type="number" min="0" defaultValue={bien.nbChambres ?? ""} className="input-base" />
          </Field>
          <Field label="Salles de bain">
            <input name="nbSallesDeBain" type="number" min="0" defaultValue={bien.nbSallesDeBain ?? ""} className="input-base" />
          </Field>
          <Field label="Étage">
            <input name="etage" type="number" min="0" defaultValue={bien.etage ?? ""} className="input-base" />
          </Field>
          <Field label="Loyer mensuel (FCFA)">
            <input name="loyer" type="number" min="0" defaultValue={bien.loyer ?? ""} className="input-base" />
          </Field>
          <Field label="Prix de vente (FCFA)">
            <input name="prixVente" type="number" min="0" defaultValue={bien.prixVente ?? ""} className="input-base" />
          </Field>
          <Field label="Caution (FCFA)">
            <input name="caution" type="number" min="0" defaultValue={bien.caution ?? ""} className="input-base" />
          </Field>
          <Field label="Propriétaire">
            <select name="proprietaireId" defaultValue={bien.proprietaireId ?? ""} className="input-base">
              <option value="">— Aucun —</option>
              {proprietaires.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}{p.prenom ? " " + p.prenom : ""}</option>
              ))}
            </select>
          </Field>
          <Field label="Couleur d&apos;accent">
            <select name="accent" defaultValue={bien.accent} className="input-base">{ACCENTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </Field>
          <Field label="Équipements" hint="Séparés par des virgules" className="sm:col-span-2">
            <input name="equipements" defaultValue={parseArray(bien.equipements).join(", ")} className="input-base" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea name="description" rows={4} defaultValue={bien.description ?? ""} className="input-base resize-none" />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <LinkButton href="/admin/biens" variant="ghost" size="md">Annuler</LinkButton>
          <Button type="submit"><Save className="h-4 w-4" /> Enregistrer les modifications</Button>
        </div>
      </form>
    </>
  );
}
