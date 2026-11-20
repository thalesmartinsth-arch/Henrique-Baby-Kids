"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Star, Trash2 } from "lucide-react";
import { browserClient } from "@/lib/supabase/browser";
import { addImageByUrl, addProductImages, deleteProductImage, reorderProductImages, updateImageAlt } from "@/app/admin/actions";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/format";
import { useAction } from "./useAction";

type Img = { id: string; url: string; alt: string };

const BUCKET = "product-images";
const MAX_SIDE = 1800;

/** Reduz a foto para no máximo 1800px e converte para WebP antes do envio. */
async function optimize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao converter"))), "image/webp", 0.85));
}

export function ImageManager({ productId, productName, images }: { productId: string; productName: string; images: Img[] }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [drag, setDrag] = useState(false);
  const [url, setUrl] = useState("");
  const notify = useUI((s) => s.notify);
  const { pending, run } = useAction();

  const upload = async (files: FileList | File[]) => {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploading(list.length);
    const supabase = browserClient();
    const done: { url: string; storage_path: string; alt: string }[] = [];
    for (const file of list) {
      try {
        if (file.size > 15 * 1024 * 1024) throw new Error(`${file.name} passa de 15 MB`);
        const blob = await optimize(file);
        const path = `${productId}/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (error) throw new Error(error.message);
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        done.push({ url: data.publicUrl, storage_path: path, alt: productName });
      } catch (e) {
        notify({ title: "Falha ao enviar foto", description: e instanceof Error ? e.message : String(e), tone: "error" });
      }
      setUploading((n) => n - 1);
    }
    if (done.length) run(() => addProductImages(productId, done), { success: `${done.length} foto(s) adicionada(s)` });
  };

  const move = (i: number, dir: -1 | 1) => {
    const ids = images.map((x) => x.id);
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    run(() => reorderProductImages(productId, ids));
  };

  const makeMain = (i: number) => {
    const ids = images.map((x) => x.id);
    const [img] = ids.splice(i, 1);
    run(() => reorderProductImages(productId, [img, ...ids]), { success: "Foto principal definida" });
  };

  return (
    <section className="adm-card" aria-labelledby="img-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 id="img-title" className="adm-h2">Fotos ({images.length})</h2>
        <p className="text-[12px] text-navy-soft">A primeira foto é a principal. Formato retrato (3:4) fica melhor.</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.id} className="group">
            <div className={cn("relative aspect-[3/4] overflow-hidden rounded-[4px] bg-mist", i === 0 && "ring-2 ring-navy ring-offset-2")}>
              <Image src={img.url} alt={img.alt} fill sizes="200px" className="object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-[3px] bg-navy px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Principal</span>}
              <div className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
                <div className="flex gap-1">
                  <button type="button" disabled={pending || i === 0} onClick={() => move(i, -1)} aria-label="Mover para a esquerda" className="grid size-8 place-items-center rounded-full bg-white/95 text-navy shadow disabled:opacity-30">
                    <ArrowLeft className="size-3.5" />
                  </button>
                  <button type="button" disabled={pending || i === images.length - 1} onClick={() => move(i, 1)} aria-label="Mover para a direita" className="grid size-8 place-items-center rounded-full bg-white/95 text-navy shadow disabled:opacity-30">
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
                <div className="flex gap-1">
                  {i > 0 && (
                    <button type="button" disabled={pending} onClick={() => makeMain(i)} aria-label="Definir como principal" className="grid size-8 place-items-center rounded-full bg-white/95 text-navy shadow">
                      <Star className="size-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => confirm("Remover esta foto?") && run(() => deleteProductImage(img.id), { success: "Foto removida" })}
                    aria-label="Remover foto"
                    className="grid size-8 place-items-center rounded-full bg-white/95 text-rose-deep shadow"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <label className="sr-only" htmlFor={`alt-${img.id}`}>Descrição da foto {i + 1}</label>
            <input
              id={`alt-${img.id}`}
              defaultValue={img.alt}
              onBlur={(e) => e.target.value !== img.alt && run(() => updateImageAlt(img.id, e.target.value))}
              placeholder="Descrição (acessibilidade)"
              className="adm-input mt-1.5 h-8 text-[12px]"
            />
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              upload(e.dataTransfer.files);
            }}
            className={cn(
              "flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 whitespace-pre-line rounded-[4px] border-2 border-dashed text-center text-[12px] text-navy-soft transition-colors",
              drag ? "border-sky-deep bg-sky-soft" : "border-line hover:border-navy hover:text-navy",
            )}
          >
            <ImagePlus className="size-6" strokeWidth={1.4} />
            {uploading ? `Enviando ${uploading}…` : "Adicionar fotos\nou arraste aqui"}
          </button>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) upload(e.target.files);
              e.target.value = "";
            }}
          />
        </li>
      </ul>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => addImageByUrl(productId, url, productName), { success: "Foto adicionada", onSuccess: () => setUrl("") });
        }}
      >
        <label htmlFor="img-url" className="sr-only">Endereço da imagem</label>
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy/40" />
          <input id="img-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Ou cole o link https:// de uma foto" className="adm-input pl-9" />
        </div>
        <button type="submit" disabled={!url || pending} className="btn btn-outline btn-sm">Adicionar link</button>
      </form>
    </section>
  );
}
