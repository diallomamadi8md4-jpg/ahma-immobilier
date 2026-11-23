"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, Save, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { POSTES_ADMIN_SUGGESTIONS } from "@/lib/postes";

export type MonCompteAdmin = { id: number; nom: string; email: string; poste: string; createdAt: string };

export function MonCompteForm({ admin }: { admin: MonCompteAdmin }) {
  const router = useRouter();
  const [nom, setNom] = useState(admin.nom);
  const [email, setEmail] = useState(admin.email);
  const [poste, setPoste] = useState(admin.poste);
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [show, setShow] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(payload: Record<string, string>, setBusy: (v: boolean) => void, message: string) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/mon-compte", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible d'enregistrer les modifications.");
        return;
      }
      setSuccess(message);
      if ("nouveauMotDePasse" in payload) {
        setActuel("");
        setNouveau("");
        setConfirmation("");
      }
      router.refresh();
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          {success}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit({ nom, email, poste }, setSavingProfile, "Profil mis à jour.");
          }}
          className="surface-panel p-6"
        >
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <UserRound className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-semibold text-ink-900 dark:text-white">Informations du profil</h2>
              <p className="text-xs text-ink-400">Ces informations apparaissent dans l&apos;espace d&apos;administration.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Nom complet *">
              <input required minLength={2} value={nom} onChange={(e) => setNom(e.target.value)} className="input-base" />
            </Field>
            <Field label="Email *">
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" />
            </Field>
            <Field label="Poste dans l'agence *" hint="Votre fonction au sein de l'agence.">
              <input
                required
                minLength={2}
                maxLength={80}
                list="postes-admin-mon-compte"
                value={poste}
                onChange={(e) => setPoste(e.target.value)}
                className="input-base"
                placeholder="Gestionnaire immobilier"
              />
              <datalist id="postes-admin-mon-compte">
                {POSTES_ADMIN_SUGGESTIONS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {savingProfile ? "Enregistrement…" : "Enregistrer le profil"}
            </Button>
          </div>
        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nouveau !== confirmation) {
              setError("La confirmation du mot de passe ne correspond pas.");
              return;
            }
            void submit(
              { motDePasseActuel: actuel, nouveauMotDePasse: nouveau, confirmation },
              setSavingPassword,
              "Mot de passe modifié. Utilisez-le pour vos prochaines connexions."
            );
          }}
          className="surface-panel p-6"
        >
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-gradient text-white">
              <LockKeyhole className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-semibold text-ink-900 dark:text-white">Modifier le mot de passe</h2>
              <p className="text-xs text-ink-400">L&apos;ancien mot de passe est nécessaire pour valider le changement.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Mot de passe actuel *">
              <input
                required
                type={show ? "text" : "password"}
                value={actuel}
                onChange={(e) => setActuel(e.target.value)}
                autoComplete="current-password"
                className="input-base"
                placeholder="••••••••"
              />
            </Field>
            <Field label="Nouveau mot de passe *" hint="10 caractères minimum — majuscules, chiffres et symboles recommandés.">
              <input
                required
                minLength={10}
                type={show ? "text" : "password"}
                value={nouveau}
                onChange={(e) => setNouveau(e.target.value)}
                autoComplete="new-password"
                className="input-base"
                placeholder="••••••••••••"
              />
            </Field>
            <Field label="Confirmer le nouveau mot de passe *">
              <div className="relative">
                <input
                  required
                  minLength={10}
                  type={show ? "text" : "password"}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="new-password"
                  className="input-base pr-11"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Masquer les mots de passe" : "Afficher les mots de passe"}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition hover:text-brand-600"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="gold" disabled={savingPassword}>
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {savingPassword ? "Modification…" : "Changer le mot de passe"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
