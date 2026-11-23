"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Loader2, Pencil, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { initials } from "@/lib/utils";
import { POSTES_ADMIN_SUGGESTIONS } from "@/lib/postes";

export type AdminItem = { id: number; nom: string; email: string; poste: string; createdAt: string };

type FormState = { id: number | null; nom: string; email: string; poste: string; password: string };

export function AdminComptes({ admins, currentId }: { admins: AdminItem[]; currentId: number }) {
  const router = useRouter();
  const [list, setList] = useState(admins);
  const [form, setForm] = useState<FormState | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  function openNew() {
    setForm({ id: null, nom: "", email: "", poste: "Administrateur", password: "" });
    setShowPassword(false);
    setError("");
    setSuccess("");
  }

  function openEdit(admin: AdminItem) {
    setForm({ id: admin.id, nom: admin.nom, email: admin.email, poste: admin.poste, password: "" });
    setShowPassword(false);
    setError("");
    setSuccess("");
  }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const editing = form.id !== null;
      const res = await fetch(editing ? `/api/admin/comptes/${form.id}` : "/api/admin/comptes", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: form.nom, email: form.email, poste: form.poste, ...(form.password ? { password: form.password } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible d'enregistrer le compte.");
        return;
      }
      if (editing) {
        setList((prev) => prev.map((a) => (a.id === data.admin.id ? data.admin : a)));
        setSuccess("Compte mis à jour.");
      } else {
        setList((prev) => [...prev, data.admin]);
        setSuccess("Compte créé. Communiquez les identifiants à la personne concernée.");
      }
      setForm(null);
      router.refresh();
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function remove(admin: AdminItem) {
    if (!window.confirm(`Supprimer le compte « ${admin.nom} » (${admin.email}) ?`)) return;
    setBusyId(admin.id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/comptes/${admin.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible de supprimer le compte.");
        return;
      }
      setList((prev) => prev.filter((a) => a.id !== admin.id));
      setSuccess("Compte supprimé.");
      router.refresh();
    } catch {
      setError("Erreur réseau, réessayez.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500 dark:text-ink-400">
          {list.length} compte(s) administrateur(s) — seul un admin peut créer ou modifier un accès.
        </p>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4" /> Nouveau compte
        </Button>
      </div>

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

      {form && (
        <form onSubmit={save} className="surface-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div>
                <h2 className="font-semibold text-ink-900 dark:text-white">
                  {form.id ? "Modifier le compte" : "Créer un compte administrateur"}
                </h2>
                <p className="text-xs text-ink-400">Les mots de passe sont hachés avant stockage.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label="Fermer le formulaire"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom complet *">
              <input
                required
                minLength={2}
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Prénom Nom"
                className="input-base"
              />
            </Field>
            <Field label="Email *">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@ahma-immobilier.ci"
                className="input-base"
              />
            </Field>
            <Field label="Poste dans l'agence *" hint="Fonction occupée au sein de l'agence.">
              <input
                required
                minLength={2}
                maxLength={80}
                list="postes-admin"
                value={form.poste}
                onChange={(e) => setForm({ ...form, poste: e.target.value })}
                placeholder="Gestionnaire immobilier"
                className="input-base"
              />
              <datalist id="postes-admin">
                {POSTES_ADMIN_SUGGESTIONS.map((poste) => (
                  <option key={poste} value={poste} />
                ))}
              </datalist>
            </Field>
            <Field
              label={form.id ? "Nouveau mot de passe (facultatif)" : "Mot de passe *"}
              hint={form.id ? "Laissez vide pour conserver le mot de passe actuel. 10 caractères minimum." : "10 caractères minimum."}
              className="sm:col-span-2"
            >
              <div className="relative">
                <input
                  required={!form.id}
                  minLength={10}
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="input-base pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 transition hover:text-brand-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setForm(null)}>Annuler</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {loading ? "Enregistrement…" : form.id ? "Enregistrer" : "Créer le compte"}
            </Button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-surface text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="px-5 py-3 font-semibold">Administrateur</th>
                <th className="px-5 py-3 font-semibold">Poste</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Créé le</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {list.map((admin) => (
                <tr key={admin.id} className="transition hover:bg-surface-2">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-[11px] font-bold text-white">
                        {initials(admin.nom)}
                      </div>
                      <div className="font-semibold text-ink-900 dark:text-white">
                        {admin.nom}
                        {admin.id === currentId && (
                          <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                            Vous
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                      {admin.poste}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink-600 dark:text-ink-300">{admin.email}</td>
                  <td className="px-5 py-3 text-xs text-ink-400">
                    {new Date(admin.createdAt).toLocaleDateString("fr-CI", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(admin)} aria-label={`Modifier ${admin.nom}`}>
                        <Pencil className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Modifier</span>
                      </Button>
                      {admin.id !== currentId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(admin)}
                          disabled={busyId === admin.id}
                          aria-label={`Supprimer ${admin.nom}`}
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10"
                        >
                          {busyId === admin.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          <span className="hidden sm:inline">Supprimer</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
