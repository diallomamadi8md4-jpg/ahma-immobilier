"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageCircle, Plus, Send, Loader2, Search, Inbox, ArrowLeft,
  CheckCheck, Building2, Users, UserSquare2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Actor } from "@/lib/actor";

type ConversationItem = {
  id: number;
  sujet: string;
  bienTitre: string | null;
  participants: { role: string; nom: string }[];
  dernierMessage: { contenu: string; createdAt: string; auteurNom: string; auteurRole: string } | null;
  unread: number;
  updatedAt: string;
};

type MessageItem = {
  id: number;
  contenu: string;
  createdAt: string;
  auteurRole: string;
  auteurNom: string;
  own: boolean;
};

type Candidate = { role: "locataire" | "proprietaire"; id: number; nom: string };

const ROLE_ICON: Record<string, typeof Users> = {
  admin: Building2,
  locataire: Users,
  proprietaire: UserSquare2,
};

function heure(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export function Messagerie({
  actor, candidates = [], biens = [],
}: {
  actor: Actor;
  candidates?: Candidate[];
  biens?: { id: number; titre: string }[];
}) {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [sending, setSending] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [error, setError] = useState("");
  const [filtre, setFiltre] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshList = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setItems(json.conversations ?? []);
      }
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshList(); }, [refreshList]);

  const openThread = useCallback(async (id: number) => {
    setSelectedId(id);
    setLoadingThread(true);
    setError("");
    try {
      const res = await fetch(`/api/conversations/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Impossible d'ouvrir cette conversation.");
      const json = await res.json();
      setMessages(json.messages ?? []);
      refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setLoadingThread(false);
    }
  }, [refreshList]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedId == null) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const contenu = String(data.get("contenu") ?? "").trim();
    if (!contenu) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/conversations/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenu }),
      });
      if (!res.ok) throw new Error("Envoi impossible.");
      form.reset();
      const thread = await fetch(`/api/conversations/${selectedId}`, { cache: "no-store" });
      const json = await thread.json();
      setMessages(json.messages ?? []);
      refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setSending(false);
    }
  }

  async function createConversation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSending(true);
    const data = new FormData(e.currentTarget);
    const [destRole, destId] = String(data.get("destinataire") ?? "").split(":");
    const body = {
      sujet: data.get("sujet"),
      message: data.get("message"),
      bienId: data.get("bienId") || undefined,
      destinataires:
        actor.role === "admin" && (destRole === "locataire" || destRole === "proprietaire") && Number.isInteger(Number(destId))
          ? [{ role: destRole, id: Number(destId) }]
          : [],
    };
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Création impossible.");
      setShowCompose(false);
      e.currentTarget.reset();
      await refreshList();
      openThread(json.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur.");
    } finally {
      setSending(false);
    }
  }

  const shown = items.filter((c) =>
    `${c.sujet} ${c.participants.map((p) => p.nom).join(" ")} ${c.bienTitre ?? ""}`
      .toLowerCase().includes(filtre.toLowerCase())
  );
  const active = items.find((c) => c.id === selectedId);
  const totalUnread = items.reduce((n, c) => n + c.unread, 0);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900 dark:text-white">
            <MessageCircle className="h-5 w-5 text-brand-600" /> Messagerie
            {totalUnread > 0 && (
              <span className="rounded-full bg-gold-500 px-2 py-0.5 text-xs font-bold text-white">{totalUnread}</span>
            )}
          </h2>
          <p className="mt-0.5 text-xs text-ink-400">Échangez directement avec l&apos;agence et les parties concernées.</p>
        </div>
        <Button size="sm" onClick={() => setShowCompose((v) => !v)}>
          {showCompose ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCompose ? "Fermer" : "Nouveau message"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>
      )}

      {showCompose && (
        <form onSubmit={createConversation} className="grid gap-3 border-b border-surface bg-surface-2/60 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label-base">Sujet *</label>
            <input name="sujet" required minLength={3} maxLength={140} className="input-base" placeholder="Ex : Question sur mon contrat" />
          </div>
          {actor.role === "admin" && (
            <div>
              <label className="label-base">Destinataire *</label>
              <select name="destinataire" required className="input-base">
                <option value="">Choisir…</option>
                <optgroup label="Locataires">
                  {candidates.filter((c) => c.role === "locataire").map((c) => (
                    <option key={`l${c.id}`} value={`locataire:${c.id}`}>{c.nom}</option>
                  ))}
                </optgroup>
                <optgroup label="Propriétaires">
                  {candidates.filter((c) => c.role === "proprietaire").map((c) => (
                    <option key={`p${c.id}`} value={`proprietaire:${c.id}`}>{c.nom}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}
          {biens.length > 0 && (
            <div>
              <label className="label-base">Bien concerné (facultatif)</label>
              <select name="bienId" className="input-base">
                <option value="">Aucun</option>
                {biens.map((b) => <option key={b.id} value={b.id}>{b.titre}</option>)}
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="label-base">Message *</label>
            <textarea name="message" required minLength={2} maxLength={4000} rows={4} className="input-base resize-none" placeholder="Bonjour, …" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Envoi…" : "Envoyer et ouvrir la conversation"}
            </Button>
          </div>
        </form>
      )}

      <div className="grid min-h-[520px] lg:grid-cols-[320px_1fr]">
        {/* Liste des conversations */}
        <aside className={cn("border-b border-surface lg:border-b-0 lg:border-r", active && "hidden lg:block")}>
          <div className="border-b border-surface p-3">
            <div className="flex items-center gap-2 rounded-lg border border-surface bg-surface px-3">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                value={filtre}
                onChange={(e) => setFiltre(e.target.value)}
                placeholder="Rechercher…"
                className="h-9 w-full bg-transparent text-sm outline-none placeholder:text-ink-400"
              />
            </div>
          </div>
          <div className="max-h-[430px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-xs text-ink-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
              </div>
            ) : shown.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <Inbox className="h-8 w-8 text-ink-300" />
                <p className="text-sm font-medium text-ink-600 dark:text-ink-300">Aucune conversation</p>
              </div>
            ) : (
              shown.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openThread(c.id)}
                  className={cn(
                    "flex w-full gap-3 border-b border-surface px-4 py-3 text-left transition hover:bg-surface-2",
                    selectedId === c.id && "bg-brand-50 dark:bg-brand-500/10"
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{c.sujet}</p>
                      {c.unread > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-white">{c.unread}</span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-400">
                      {c.participants.map((p) => p.nom).join(", ") || "Agence Ahma"}
                    </p>
                    <p className="mt-1 truncate text-xs text-ink-500 dark:text-ink-400">
                      {c.dernierMessage ? `${c.dernierMessage.auteurNom} : ${c.dernierMessage.contenu}` : "Aucun message"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Fil de discussion */}
        <section className="flex flex-col">
          {selectedId == null ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15">
                <MessageCircle className="h-7 w-7" />
              </div>
              <p className="font-semibold text-ink-800 dark:text-ink-100">Sélectionnez une conversation</p>
              <p className="max-w-sm text-sm text-ink-400">Vos échanges avec l&apos;agence apparaîtront ici.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-surface px-5 py-4">
                <button onClick={() => setSelectedId(null)} className="text-ink-400 hover:text-brand-600 lg:hidden" aria-label="Retour">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display font-bold text-ink-900 dark:text-white">{active?.sujet ?? "Conversation"}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-ink-400">
                    {(active?.participants ?? []).map((p) => {
                      const Icon = ROLE_ICON[p.role] ?? Users;
                      return <span key={`${p.role}-${p.nom}`} className="inline-flex items-center gap-1"><Icon className="h-3 w-3" />{p.nom}</span>;
                    })}
                    {active?.bienTitre && <span className="truncate">· {active.bienTitre}</span>}
                  </p>
                </div>
                <CheckCheck className="h-4 w-4 text-brand-500" />
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto bg-surface-2/40 p-5" style={{ maxHeight: 420 }}>
                {loadingThread ? (
                  <div className="flex items-center justify-center gap-2 py-14 text-xs text-ink-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Chargement des messages…
                  </div>
                ) : messages.length === 0 ? (
                  <p className="py-14 text-center text-sm text-ink-400">Aucun message dans cette conversation.</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.own ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[70%]",
                        m.own
                          ? "rounded-br-sm bg-brand-gradient text-white"
                          : "rounded-bl-sm border border-surface bg-surface text-ink-700 dark:text-ink-200"
                      )}>
                        {!m.own && <p className="mb-1 text-[11px] font-semibold opacity-70">{m.auteurNom}</p>}
                        <p className="whitespace-pre-line">{m.contenu}</p>
                        <p className={cn("mt-1 text-right text-[10px]", m.own ? "text-white/60" : "text-ink-400")}>
                          {heure(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="flex items-end gap-2 border-t border-surface p-4">
                <textarea
                  name="contenu"
                  rows={2}
                  required
                  placeholder="Écrivez votre message…"
                  className="input-base max-h-32 flex-1 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <Button type="submit" disabled={sending} className="shrink-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="hidden sm:inline">Envoyer</span>
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
