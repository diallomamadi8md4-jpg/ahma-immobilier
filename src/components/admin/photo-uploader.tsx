"use client";

import { useTransition, useRef } from "react";
import { Upload, X, Star, Loader2, ImageIcon } from "lucide-react";
import { addBienPhotosAction, removeBienPhotoAction, setBienCoverAction } from "@/actions";
import { cn } from "@/lib/utils";

export function PhotoUploader({ bienId, photos }: { bienId: number; photos: string[] }) {
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function sendFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const fd = new FormData();
    for (const file of Array.from(files)) fd.append("photos", file);
    start(() => addBienPhotosAction(bienId, fd));
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">Photos du bien</h3>
        <span className="text-xs text-ink-400">{photos.length} photo(s)</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {photos.map((p, i) => (
          <div key={p} className="group relative aspect-square overflow-hidden rounded-xl bg-ink-100 dark:bg-ink-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p} alt="" className="h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded bg-gold-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Couverture</span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ink-950/50 opacity-0 transition group-hover:opacity-100">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => start(() => setBienCoverAction(bienId, i))}
                  title="Définir comme couverture"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-ink-700 hover:bg-white"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => start(() => removeBienPhotoAction(bienId, i))}
                title="Supprimer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-rose-600 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        <label
          onDrop={(e) => {
            e.preventDefault();
            sendFiles(e.dataTransfer?.files ?? null);
          }}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-ink-400 transition hover:border-brand-500 hover:text-brand-600",
            pending ? "border-brand-400" : "border-surface"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              sendFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-xs font-medium">{pending ? "Envoi…" : "Ajouter"}</span>
        </label>

        {photos.length === 0 && !pending && (
          <div className="col-span-3 flex items-center gap-2 text-xs text-ink-400 sm:col-span-4">
            <ImageIcon className="h-4 w-4" /> Aucune photo — glisse-dépose ou clique pour ajouter. La 1ʳᵉ photo sert de couverture sur les cartes.
          </div>
        )}
      </div>
    </div>
  );
}
