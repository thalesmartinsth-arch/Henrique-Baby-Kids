"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { Sheet } from "@/components/ui/Sheet";
import { ALL_SIZES, CATEGORIES } from "@/lib/catalog";
import { useCatalog } from "@/components/CatalogProvider";
import { applyFilters, parseFilters, PRICE_RANGES, SORT_OPTIONS } from "@/lib/filters";
import { cn } from "@/lib/format";
import type { CategorySlug, Product } from "@/lib/types";

type Props = {
  products: Product[];
  /** Categoria fixada pela rota (/loja/meninas) — some dos filtros. */
  lockedCategory?: CategorySlug;
};

export function ProductListing({ products, lockedCategory }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { collections } = useCatalog();
  const filters = parseFilters(new URLSearchParams(params.toString()));
  const results = useMemo(() => applyFilters(products, filters), [products, filters]);

  const availableSizes = ALL_SIZES.filter((s) => products.some((p) => p.sizes.includes(s)));
  const categoryOptions = CATEGORIES.filter(
    (c) => c.slug !== lockedCategory && products.some((p) => p.categories.includes(c.slug)),
  );

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  const toggleInList = (key: string, current: string[], value: string) => {
    const set = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update(key, set.length ? set.join(",") : null);
  };
  const clearAll = () => startTransition(() => router.replace(pathname, { scroll: false }));

  const chips = [
    ...(filters.q ? [{ label: `“${filters.q}”`, onRemove: () => update("q", null) }] : []),
    ...(filters.collection
      ? [{ label: collections.find((c) => c.slug === filters.collection)?.name ?? filters.collection, onRemove: () => update("colecao", null) }]
      : []),
    ...filters.categories.map((c) => ({
      label: CATEGORIES.find((x) => x.slug === c)?.name ?? c,
      onRemove: () => toggleInList("categoria", filters.categories, c),
    })),
    ...filters.sizes.map((s) => ({ label: `Tam. ${s}`, onRemove: () => toggleInList("tamanho", filters.sizes, s) })),
    ...(filters.price
      ? [{ label: PRICE_RANGES.find((r) => r.value === filters.price)?.label ?? "", onRemove: () => update("preco", null) }]
      : []),
  ];

  const panel = (
    <div className="space-y-9">
      {categoryOptions.length > 0 && (
        <fieldset>
          <legend className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em]">Categoria</legend>
          <div className="space-y-1">
            {categoryOptions.map((c) => {
              const checked = filters.categories.includes(c.slug);
              const count = products.filter((p) => p.categories.includes(c.slug)).length;
              return (
                <label key={c.slug} className="group flex min-h-10 cursor-pointer items-center gap-3 text-[14px]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleInList("categoria", filters.categories, c.slug)}
                    className="peer sr-only"
                  />
                  <span className="grid size-[18px] place-items-center rounded-[3px] border border-navy/30 transition-colors peer-checked:border-navy peer-checked:bg-navy peer-focus-visible:ring-2 peer-focus-visible:ring-sky-deep">
                    {checked && <span className="size-2 rounded-[1px] bg-white" />}
                  </span>
                  <span className="flex-1 transition-colors group-hover:text-navy">{c.name}</span>
                  <span className="text-[12px] text-navy/40">{count}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em]">Tamanho</legend>
        <div className="grid grid-cols-5 gap-1.5">
          {availableSizes.map((s) => {
            const active = filters.sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={active}
                onClick={() => toggleInList("tamanho", filters.sizes, s)}
                className={cn(
                  "h-11 rounded-[3px] border text-[13px] font-medium transition-all",
                  active ? "border-navy bg-navy text-white" : "border-line bg-white hover:border-navy",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em]">Faixa de preço</legend>
        <div className="space-y-1">
          {PRICE_RANGES.map((r) => {
            const checked = filters.price === r.value;
            return (
              <label key={r.value} className="flex min-h-10 cursor-pointer items-center gap-3 text-[14px]">
                <input
                  type="radio"
                  name="preco"
                  checked={checked}
                  onChange={() => update("preco", r.value)}
                  onClick={() => checked && update("preco", null)}
                  className="peer sr-only"
                />
                <span className="grid size-[18px] place-items-center rounded-full border border-navy/30 transition-colors peer-checked:border-navy peer-focus-visible:ring-2 peer-focus-visible:ring-sky-deep">
                  {checked && <span className="size-2 rounded-full bg-navy" />}
                </span>
                {r.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {chips.length > 0 && (
        <button type="button" onClick={clearAll} className="link-underline text-[12px] font-semibold uppercase tracking-[0.16em] text-rose-deep">
          Limpar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="wrap pb-24">
      {/* Barra de ferramentas */}
      <div className="sticky top-[108px] z-30 -mx-4 mb-8 flex items-center justify-between gap-3 border-y border-line bg-ivory/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-t-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
        <button type="button" onClick={() => setFiltersOpen(true)} className="btn btn-outline min-h-11 px-4 lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filtrar {chips.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-rose text-[10px] text-navy">{chips.length}</span>}
        </button>
        <p className="hidden text-[13px] text-navy-soft lg:block" aria-live="polite">
          {results.length} {results.length === 1 ? "produto" : "produtos"}
        </p>
        <label className="relative flex items-center gap-2 text-[13px]">
          <span className="hidden text-navy-soft sm:inline">Ordenar por</span>
          <select
            value={filters.sort}
            onChange={(e) => update("ordem", e.target.value === "relevancia" ? null : e.target.value)}
            className="h-11 cursor-pointer appearance-none rounded-[3px] border border-line bg-white pl-4 pr-10 font-semibold text-navy outline-none transition-colors hover:border-navy"
            aria-label="Ordenar produtos"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 size-4" />
        </label>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-[190px]">{panel}</div>
        </aside>

        <div>
          {chips.length > 0 && (
            <ul className="mb-6 flex flex-wrap gap-2" aria-label="Filtros ativos">
              {chips.map((c) => (
                <li key={c.label}>
                  <button
                    type="button"
                    onClick={c.onRemove}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full bg-sky-soft px-4 text-[12px] font-semibold text-navy transition-colors hover:bg-blush"
                    aria-label={`Remover filtro ${c.label}`}
                  >
                    {c.label} <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mb-4 text-[13px] text-navy-soft lg:hidden" aria-live="polite">
            {results.length} {results.length === 1 ? "produto" : "produtos"}
          </p>

          {results.length ? (
            <motion.ul layout className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 xl:grid-cols-3 xl:gap-y-14">
              <AnimatePresence mode="popLayout">
                {results.map((p, i) => (
                  <motion.li
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductCard product={p} priority={i < 3} sizes="(min-width: 1280px) 28vw, (min-width: 1024px) 38vw, 50vw" />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white px-6 py-20 text-center">
              <p className="font-serif text-3xl">Nenhuma peça com esses filtros</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-navy-soft">Tente remover um tamanho ou ampliar a faixa de preço.</p>
              <button type="button" onClick={clearAll} className="btn btn-primary mt-8">
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        side="left"
        label="Filtros"
        title="Filtrar"
        footer={
          <div className="p-5">
            <button type="button" onClick={() => setFiltersOpen(false)} className="btn btn-primary w-full">
              Ver {results.length} {results.length === 1 ? "produto" : "produtos"}
            </button>
          </div>
        }
      >
        <div className="p-5">{panel}</div>
      </Sheet>
    </div>
  );
}
