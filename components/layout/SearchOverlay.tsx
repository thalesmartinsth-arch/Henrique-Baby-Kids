"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useState } from "react";
import { Search } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { searchProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useUI } from "@/store/ui";

const SUGGESTIONS = ["Vestido", "Conjunto", "Linho", "Tricô", "Bebê", "Jeans"];

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const results = searchProducts(deferred).slice(0, 6);

  const close = () => setOpen(false);
  const submit = (q: string) => {
    if (!q.trim()) return;
    close();
    router.push(`/loja?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <Sheet open={open} onClose={close} side="top" label="Buscar produtos" title="Buscar" className="bg-ivory">
      <div className="wrap py-6 sm:py-10">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            submit(query);
          }}
          className="relative mx-auto max-w-3xl"
        >
          <label htmlFor="search-input" className="sr-only">
            O que você procura?
          </label>
          <Search className="pointer-events-none absolute left-0 top-1/2 size-6 -translate-y-1/2 text-navy/50" strokeWidth={1.4} />
          <input
            id="search-input"
            data-autofocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="O que você procura?"
            autoComplete="off"
            className="h-16 w-full border-b border-navy/20 bg-transparent pl-10 font-serif text-3xl text-navy outline-none placeholder:text-navy/30 focus:border-navy sm:text-4xl"
          />
        </form>

        <div className="mx-auto mt-8 max-w-3xl">
          {!deferred.trim() ? (
            <div>
              <p className="eyebrow mb-4">Buscas frequentes</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="min-h-11 rounded-[3px] border border-line bg-white px-4 text-[13px] font-medium transition-all hover:-translate-y-px hover:border-navy"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length ? (
            <>
              <p className="eyebrow mb-4">{searchProducts(deferred).length} resultado(s)</p>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link href={`/produto/${p.slug}`} onClick={close} className="group flex gap-3 rounded-[3px] p-1 transition-colors hover:bg-white">
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[3px] bg-mist">
                        <Image src={p.images[0].src} alt="" fill sizes="64px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <div className="min-w-0 py-1">
                        <p className="line-clamp-2 text-[13px] font-semibold leading-snug">{p.name}</p>
                        <p className="mt-1 text-[12px] text-navy-soft">{formatPrice(p.price)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => submit(query)} className="btn btn-primary mt-6">
                Ver todos os resultados
              </button>
            </>
          ) : (
            <p className="text-navy-soft">
              Nenhum produto encontrado para “{deferred}”. Tente “vestido” ou “conjunto”.
            </p>
          )}
        </div>
      </div>
    </Sheet>
  );
}
