import { ArrowLeft, Save } from "lucide-react";
import prisma from "@/lib/prisma";
import { createBienAction } from "@/actions";
import { PageHeader } from "@/components/admin/page-header";
import { Field } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";

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

export default async function NouveauBienPage() {
  const proprietaires = await prisma.proprietaire.findMany({ orderBy: { nom: "asc" } });

  return (
    <>
      <PageHeader title="Nouveau bien" subtitle="Ajoutez un bien au catalogue Ahma Immobilier">
        <LinkButton href="/admin/biens" variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Retour</LinkButton>
      </PageHeader>

      <form action={createBienAction} className="card mx-auto max-w-3xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titre du bien *" className="sm:col-span-2">
            <input name="titre" required placeholder="Villa moderne avec piscine" className="input-base" />
          </Field>
          <Field label="Type *">
            <select name="type" className="input-base">{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </Field>
          <Field label="Statut">
            <select name="statut" className="input-base">{STATUTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </Field>
          <Field label="Quartier *">
            <input name="quartier" required placeholder="Cocody Riviera" className="input-base" />
          </Field>
          <Field label="Adresse">
            <input name="adresse" placeholder="Rue, repère…" className="input-base" />
          </Field>
          <Field label="Superficie (m²) *">
            <input name="superficie" type="number" min="0" required placeholder="150" className="input-base" />
          </Field>
          <Field label="Chambres">
            <input name="nbChambres" type="number" min="0" placeholder="3" className="input-base" />
          </Field>
          <Field label="Salles de bain">
            <input name="nbSallesDeBain" type="number" min="0" placeholder="2" className="input-base" />
          </Field>
          <Field label="Étage">
            <input name="etage" type="number" min="0" placeholder="3" className="input-base" />
          </Field>
          <Field label="Loyer mensuel (FCFA)">
            <input name="loyer" type="number" min="0" placeholder="900000" className="input-base" />
          </Field>
          <Field label="Prix de vente (FCFA)">
            <input name="prixVente" type="number" min="0" placeholder="65000000" className="input-base" />
          </Field>
          <Field label="Caution (FCFA)">
            <input name="caution" type="number" min="0" placeholder="1800000" className="input-base" />
          </Field>
          <Field label="Propriétaire">
            <select name="proprietaireId" className="input-base">
              <option value="">— Aucun —</option>
              {proprietaires.map((p) => (
                <option key={p.id} value={p.id}>{p.nom}{p.prenom ? " " + p.prenom : ""}</option>
              ))}
            </select>
          </Field>
          <Field label="Couleur d&apos;accent">
            <select name="accent" className="input-base">{ACCENTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </Field>
          <Field label="Équipements" hint="Séparés par des virgules" className="sm:col-span-2">
            <input name="equipements" placeholder="Piscine, Climatisation, Garage" className="input-base" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea name="description" rows={4} placeholder="Description du bien…" className="input-base resize-none" />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <LinkButton href="/admin/biens" variant="ghost" size="md">Annuler</LinkButton>
          <Button type="submit"><Save className="h-4 w-4" /> Enregistrer le bien</Button>
        </div>
      </form>
    </>
  );
}
