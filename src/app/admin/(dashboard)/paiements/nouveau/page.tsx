import { ArrowLeft, Save } from "lucide-react";
import prisma from "@/lib/prisma";
import { createPaiementAction } from "@/actions";
import { PageHeader } from "@/components/admin/page-header";
import { Field } from "@/components/ui/field";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function NouveauPaiementPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  const contrats = await prisma.contrat.findMany({
    where: { statut: { in: ["actif", "a_venir"] } },
    include: { bien: true, locataire: true },
    orderBy: { dateDebut: "desc" },
  });

  const preContratId = String(searchParams.contratId ?? "");
  const preContrat = contrats.find((c) => String(c.id) === preContratId);
  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = new Date().toISOString().slice(0, 7);
  const ref = `AHM-${thisMonth.replace("-", "")}-${Math.floor(Math.random() * 9000 + 1000)}`;

  return (
    <>
      <PageHeader title="Encaisser un loyer" subtitle="Enregistrez un paiement et générez sa quittance">
        <LinkButton href="/admin/paiements" variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Retour</LinkButton>
      </PageHeader>

      <form action={createPaiementAction} className="card mx-auto max-w-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contrat *" className="sm:col-span-2">
            <select name="contratId" required defaultValue={preContratId} className="input-base">
              <option value="">— Sélectionner un contrat —</option>
              {contrats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.bien.titre} · {c.locataire.nom} · {c.loyerMensuel.toLocaleString("fr-FR")} FCFA
                </option>
              ))}
            </select>
          </Field>
          <Field label="Montant (FCFA) *">
            <input name="montant" type="number" min="0" required defaultValue={preContrat?.loyerMensuel} placeholder="900000" className="input-base" />
          </Field>
          <Field label="Date d&apos;encaissement">
            <input name="datePaiement" type="date" defaultValue={today} className="input-base" />
          </Field>
          <Field label="Mois concerné *">
            <input name="moisConcerne" type="month" required defaultValue={thisMonth} className="input-base" />
          </Field>
          <Field label="Moyen de règlement">
            <select name="methode" className="input-base">
              <option value="especes">Espèces</option>
              <option value="virement">Virement bancaire</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="chequier">Chèque</option>
            </select>
          </Field>
          <Field label="Statut">
            <select name="statut" className="input-base">
              <option value="paye">Payé (encaissé)</option>
              <option value="en_attente">En attente</option>
            </select>
          </Field>
          <Field label="Référence">
            <input name="reference" defaultValue={ref} className="input-base" />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <LinkButton href="/admin/paiements" variant="ghost">Annuler</LinkButton>
          <Button type="submit"><Save className="h-4 w-4" /> Enregistrer le paiement</Button>
        </div>
      </form>
    </>
  );
}
