"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell, BellOff, CheckCheck, Loader2, MapPin, Search, Trash2,
  ExternalLink, AlertCircle, KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALERTE_TOKEN_KEY } from "@/components/public/save-search";
import { cn, formatDate, formatFCFA } from "@/lib/utils";
import { criteriaLabel, criteriaToQuery, type SearchCriteria } from "@/lib/search";

type Recherche = {
  id: number;
  token: string;
  email: string;
  criteres: SearchCriteria;
  frequence: string;
  actif: boolean;
  createdAt: string;
  alertes: number;
};

type Alerte = {
  id: number;
  bienId: number;
  titre: string;
  quartier: string;
  loyer: number | null;
  photo: string | null;
  lu: boolean;
  createdAt: string;
};

export function AlertesView({ tokenFromUrl }: { tokenFromUrl?: string }) {
  const [token, setToken] = useState(tokenFromUrl ?? "");
  const [recherches, setRecherches] = useState<Recherche[]>([]);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inputToken, setInputToken] = useState("");

  const load = useCallback(async (t: string) => {
    setLoading(true);
    setError("");
    const suffix = t ? `?token=${encodeURIComponent(t)}` : "";
    try {
      const [rRes, aRes] = await Promise.all([
        fetch(`/api/recherches${suffix}`, { cache: "no-store" }),
        fetch(`/api/alertes${suffix}`, { cache: "no-store" }),
      ]);
      if (!rRes.ok || !aRes.ok) {
        setError("Lien de gestion invalide ou expiré. Vérifiez le lien reçu par email.");
        return;
      }
      const [rJson, aJson] = await Promise.all([rRes.json(), aRes.json()]);
      setRecherches(rJson.recherches ?? []);
      setAlertes(aJson.alertes ?? []);
      setCount(Number(aJson.count) || 0);
    } catch {
      setError("Impossible de charger vos alertes. Réessayez.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = tokenFromUrl || localStorage.getItem(ALERTE_TOKEN_KEY) || "";
    setToken(t);
    if (tokenFromUrl) localStorage.setItem(ALERTE_TOKEN_KEY, tokenFromUrl);
    if (t) load(t);
    else load("");
  }, [tokenFromUrl, load]);

  async function markRead(all: boolean, ids: number[] = []) {
    const res = await fetch("/api/alertes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token || undefined, all, ids }),
    });
    if (res.ok) load(token);
  }

  async function toggleRecherche(r: Recherche) {
    await fetch(`/api/recherches/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: token || undefined, actif: !r.actif }),
    });
    load(token);
  }

  async function deleteRecherche(r: Recherche) {
    if (!confirm("Supprimer cette recherche et ses alertes ?")) return;
    await fetch(`/api/recherches/${r.id}${token ? `?token=${encodeURIComponent(token)}` : ""}`, { method: "DELETE" });
    load(token);
  }

  if (loading) {
    return (
      <div className="card flex items-center justify-center gap-2 py-20 text-sm text-ink-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Chargement de vos alertes…
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <KeyRound className="mx-auto h-10 w-10 text-gold-500" />
        <h2 className="mt-4 font-display text-lg font-bold text-ink-900 dark:text-white">Accédez à vos alertes</h2>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          Vos alertes sont protégées par un lien privé. Collez ci-dessous le lien reçu lors de l&apos;enregistrement,
          ou enregistrez une nouvelle recherche depuis le catalogue.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = inputToken.trim().split("token=")[1]?.split("&")[0] || inputToken.trim();
            localStorage.setItem(ALERTE_TOKEN_KEY, t);
            setToken(t);
            load(t);
          }}
          className="mt-6 space-y-3 text-left"
        >
          <label htmlFor="alert-token" className="label-base">Lien ou clé privée</label>
          <input id="alert-token" value={inputToken} onChange={(e) => setInputToken(e.target.value)} className="input-base" placeholder="https://…/alertes?token=…" />
          <Button type="submit" className="w-full">Accéder à mes alertes</Button>
        </form>
        <Link href="/biens" className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline">
          Enregistrer une recherche →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">
            Nouveaux biens <span className="ml-1 rounded-full bg-gold-50 px-2 py-0.5 text-sm text-gold-700 dark:bg-gold-500/15 dark:text-gold-300">{count}</span>
          </h2>
          {count > 0 && (
            <Button variant="outline" size="sm" onClick={() => markRead(true)}>
              <CheckCheck className="h-4 w-4" /> Tout marquer comme lu
            </Button>
          )}
        </div>

        {alertes.length === 0 ? (
          <div className="card mt-4 flex flex-col items-center gap-2 py-14 text-center">
            <Bell className="h-9 w-9 text-ink-300" />
            <p className="font-semibold text-ink-800 dark:text-ink-100">Aucune alerte pour l&apos;instant</p>
            <p className="max-w-md text-sm text-ink-400">
              Dès qu&apos;un bien correspondant à l&apos;une de vos recherches sera ajouté, il apparaîtra ici.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {alertes.map((a) => (
              <div
                key={a.id}
                className={cn(
                  "card flex items-center gap-4 p-4 transition",
                  !a.lu && "border-brand-300 bg-brand-50/40 dark:bg-brand-500/5"
                )}
              >
                <div
                  className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2 bg-cover bg-center"
                  style={a.photo ? { backgroundImage: `url(${a.photo})` } : undefined}
                  aria-hidden="true"
                >
                  {!a.photo && <Search className="h-5 w-5 text-ink-300" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!a.lu && <span className="h-2 w-2 shrink-0 rounded-full bg-gold-500" />}
                    <p className="truncate font-semibold text-ink-900 dark:text-white">{a.titre}</p>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400"><MapPin className="h-3 w-3" /> {a.quartier}</p>
                  <p className="mt-1 text-sm font-bold text-brand-700 dark:text-brand-300">{a.loyer ? formatFCFA(a.loyer) + " / mois" : "Sur devis"}</p>
                  <p className="mt-1 text-[11px] text-ink-400">{formatDate(a.createdAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <Link href={`/biens/${a.bienId}`} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                    Voir <ExternalLink className="h-3 w-3" />
                  </Link>
                  {!a.lu && (
                    <button onClick={() => markRead(false, [a.id])} className="rounded-lg px-2 py-1 text-[11px] font-semibold text-ink-400 hover:text-brand-600">
                      Marquer lu
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-ink-900 dark:text-white">Mes recherches enregistrées</h2>
        {recherches.length === 0 ? (
          <div className="card mt-4 flex flex-col items-center gap-2 py-14 text-center">
            <Search className="h-9 w-9 text-ink-300" />
            <p className="font-semibold text-ink-800 dark:text-ink-100">Aucune recherche enregistrée</p>
            <Link href="/biens" className="mt-1 text-sm font-semibold text-brand-600 hover:underline">Explorer le catalogue →</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {recherches.map((r) => (
              <div key={r.id} className="card flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                      r.actif
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                        : "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"
                    )}>
                      {r.actif ? "Active" : "Désactivée"}
                    </span>
                    <span className="text-xs text-ink-400">Suivi des nouveautés</span>
                    <span className="text-xs text-ink-400">{r.alertes} alerte{r.alertes > 1 ? "s" : ""}</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink-800 dark:text-ink-100">{criteriaLabel(r.criteres)}</p>
                  <p className="mt-0.5 text-xs text-ink-400">Enregistrée le {formatDate(r.createdAt)} · {r.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={criteriaToQuery(r.criteres)} className="rounded-lg bg-surface-2 px-3 py-2 text-xs font-semibold text-ink-600 hover:text-brand-600 dark:text-ink-300">
                    Voir les résultats
                  </Link>
                  <button
                    onClick={() => toggleRecherche(r)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-surface px-3 py-2 text-xs font-semibold text-ink-600 hover:text-brand-600 dark:text-ink-300"
                  >
                    {r.actif ? <BellOff className="h-3.5 w-3.5" /> : <Bell className="h-3.5 w-3.5" />}
                    {r.actif ? "Désactiver" : "Activer"}
                  </button>
                  <button
                    onClick={() => deleteRecherche(r)}
                    aria-label="Supprimer la recherche"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface text-ink-400 transition hover:border-rose-200 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
