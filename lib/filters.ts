import { normalize } from "./catalog";
import type { Product } from "./types";

export type SortKey = "relevancia" | "novidades" | "menor-preco" | "maior-preco" | "desconto";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevancia", label: "Relevância" },
  { value: "novidades", label: "Novidades" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "desconto", label: "Maior desconto" },
];

export const PRICE_RANGES = [
  { value: "ate-100", label: "Até R$ 100", min: 0, max: 100 },
  { value: "100-150", label: "R$ 100 a R$ 150", min: 100, max: 150 },
  { value: "150-200", label: "R$ 150 a R$ 200", min: 150, max: 200 },
  { value: "acima-200", label: "Acima de R$ 200", min: 200, max: Infinity },
];

export type Filters = {
  q: string;
  categories: string[];
  sizes: string[];
  price: string | null;
  collection: string | null;
  sort: SortKey;
};

/** Lê os filtros da URL — a URL é a fonte da verdade (compartilhável e com voltar/avançar). */
export function parseFilters(params: URLSearchParams): Filters {
  const list = (k: string) => (params.get(k) ?? "").split(",").filter(Boolean);
  const sort = params.get("ordem") as SortKey | null;
  return {
    q: params.get("q") ?? "",
    categories: list("categoria"),
    sizes: list("tamanho"),
    price: params.get("preco"),
    collection: params.get("colecao"),
    sort: sort && SORT_OPTIONS.some((o) => o.value === sort) ? sort : "relevancia",
  };
}

export function applyFilters(products: Product[], f: Filters) {
  const terms = normalize(f.q).split(/\s+/).filter(Boolean);
  const range = PRICE_RANGES.find((r) => r.value === f.price);

  const result = products.filter((p) => {
    if (terms.length) {
      const hay = normalize([p.name, p.shortDescription, p.color, ...p.categories].join(" "));
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    if (f.categories.length && !f.categories.some((c) => p.categories.includes(c as never))) return false;
    if (f.sizes.length && !f.sizes.some((s) => p.sizes.includes(s) && !p.soldOut?.includes(s))) return false;
    if (f.collection && p.collection !== f.collection) return false;
    if (range && (p.price < range.min || p.price >= range.max)) return false;
    return true;
  });

  const off = (p: Product) => (p.compareAtPrice ? 1 - p.price / p.compareAtPrice : 0);
  const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
    relevancia: (a, b) => Number(!!b.isNew) - Number(!!a.isNew) || off(b) - off(a),
    novidades: (a, b) => b.releasedAt.localeCompare(a.releasedAt),
    "menor-preco": (a, b) => a.price - b.price,
    "maior-preco": (a, b) => b.price - a.price,
    desconto: (a, b) => off(b) - off(a),
  };
  return [...result].sort(sorters[f.sort]);
}
