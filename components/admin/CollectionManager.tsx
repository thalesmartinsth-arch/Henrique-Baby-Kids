"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { browserClient } from "@/lib/supabase/browser";
import { deleteCollection, saveCollection } from "@/app/admin/actions";
import { useUI } from "@/store/ui";
import { useAction } from "./useAction";

export type CollectionRow = { slug: string; name: string; description: string; image_url: string | null; position: number; count: number };

function CollectionCard({ c, isNew }: { c: CollectionRow; isNew?: boolean }) {
  const [f, setF] = useState(c);
  const [uploading, setUploading] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const notify = useUI((s) => s.notify);
  const { pending, run } = useAction();

  const upload = async (picked: File) => {
    setUploading(true);
    try {
      const supabase = browserClient();
      const path = `colecoes/${crypto.randomUUID()}.${picked.name.split(".").pop() || "jpg"}`;
      const { error } = await supabase.storage.from("product-images").upload(path, picked, { contentType: picked.type, cacheControl: "31536000" });
      if (error) throw new Error(error.message);
      setF((s) => ({ ...s, image_url: supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl }));
    } catch (e) {
      notify({ title: "Falha ao enviar imagem", description: e instanceof Error ? e.message : String(e), tone: "error" });
    }
    setUploading(false);
  };

  return (
    <form
      className="adm-card grid gap-4 sm:grid-cols-[160px_1fr]"
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () => saveCollection({ name: f.name, description: f.description, image_url: f.image_url, position: f.position }, isNew ? undefined : c.slug),
          { onSuccess: () => isNew && setF({ ...c }) },
        );
      }}
    >
      <button
        type="button"
        onClick={() => file.current?.click()}
        className="group relative aspect-[3/4] overflow-hidden rounded-[4px] bg-mist text-[12px] text-navy-soft"
        aria-label="Trocar imagem da coleção"
      >
        {f.image_url ? (
          <Image src={f.image_url} alt="" fill sizes="160px" className="object-cover transition-opacity group-hover:opacity-80" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2">
            <ImagePlus className="size-6" />
            Imagem
          </span>
        )}
        {uploading && <span className="absolute inset-0 grid place-items-center bg-white/70">Enviando…</span>}
      </button>
      <input ref={file} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_90px]">
          <div>
            <label className="adm-label" htmlFor={`n-${c.slug || "new"}`}>Nome</label>
            <input id={`n-${c.slug || "new"}`} required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="adm-input" />
          </div>
          <div>
            <label className="adm-label" htmlFor={`o-${c.slug || "new"}`}>Ordem</label>
            <input id={`o-${c.slug || "new"}`} type="number" min={0} value={f.position} onChange={(e) => setF({ ...f, position: Number(e.target.value) || 0 })} className="adm-input" />
          </div>
        </div>
        <div>
          <label className="adm-label" htmlFor={`d-${c.slug || "new"}`}>Descrição</label>
          <textarea id={`d-${c.slug || "new"}`} rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="adm-input h-auto py-2" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" disabled={pending || uploading} className="btn btn-primary btn-sm">{isNew ? "Criar coleção" : "Salvar"}</button>
          {!isNew && (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => confirm(`Excluir a coleção ${c.name}? Os produtos ficam sem coleção.`) && run(() => deleteCollection(c.slug), { success: "Coleção excluída" })}
                className="btn btn-sm text-rose-deep hover:bg-blush"
              >
                Excluir
              </button>
              <span className="text-[12px] text-navy-soft">{c.count} produtos</span>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

export function CollectionManager({ collections }: { collections: CollectionRow[] }) {
  return (
    <div className="space-y-4">
      {collections.map((c) => (
        <CollectionCard key={c.slug} c={c} />
      ))}
      <h2 className="adm-h2 pt-4">Nova coleção</h2>
      <CollectionCard isNew c={{ slug: "", name: "", description: "", image_url: null, position: collections.length, count: 0 }} />
    </div>
  );
}
