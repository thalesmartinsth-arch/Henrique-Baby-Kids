import { photo, PHOTOS } from "./images";
import type { Category, Product } from "./types";

// ---------------------------------------------------------------------------
// Constantes da vitrine e funções puras sobre o catálogo.
// Os produtos vêm do Supabase (lib/data/catalog.ts) e são gerenciados no /admin.
// ---------------------------------------------------------------------------

export const FREE_SHIPPING_THRESHOLD = 199;

export const KIDS_SIZES = ["1", "2", "3", "4", "6", "8", "10", "12"];
export const BABY_SIZES = ["RN", "P", "M", "G", "GG"];
export const ALL_SIZES = [...BABY_SIZES, ...KIDS_SIZES];

export const CATEGORIES: Category[] = [
  { slug: "meninas", name: "Meninas", tagline: "Delicadeza com personalidade", image: photo(PHOTOS.catGirls) },
  { slug: "meninos", name: "Meninos", tagline: "Clássicos para o dia a dia", image: photo(PHOTOS.catBoys) },
  { slug: "bebes", name: "Bebês", tagline: "Toque macio, do RN ao GG", image: photo(PHOTOS.catBabies) },
  { slug: "conjuntos", name: "Conjuntos", tagline: "Combinações prontas", image: photo(PHOTOS.catSets) },
  { slug: "vestidos", name: "Vestidos", tagline: "Para festas e passeios", image: photo(PHOTOS.catDresses) },
  { slug: "acessorios", name: "Acessórios", tagline: "Chapéus, sapatinhos e mais", image: photo(PHOTOS.catAccessories) },
];

export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export const getNewArrivals = (products: Product[]) =>
  products.filter((x) => x.isNew).sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));

export const getFeatured = (products: Product[]) => {
  const featured = products.filter((p) => p.featured);
  return featured.length ? featured : products.slice(0, 8);
};

export function getRelated(products: Product[], product: Product, limit = 4) {
  return products
    .filter((x) => x.id !== product.id && x.categories.some((c) => product.categories.includes(c)))
    .sort((a, b) => Number(b.collection === product.collection) - Number(a.collection === product.collection))
    .slice(0, limit);
}

export function searchProducts(products: Product[], query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return products.filter((x) => {
    const haystack = normalize([x.name, x.shortDescription, x.color, ...x.categories].join(" "));
    return terms.every((t) => haystack.includes(t));
  });
}

/** Peças disponíveis de um tamanho. */
export const stockOf = (product: Product, size: string) => product.stock[size] ?? 0;
