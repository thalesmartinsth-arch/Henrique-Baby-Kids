import "server-only";
import { cache } from "react";
import { publicClient } from "@/lib/supabase/public";
import type { CategorySlug, Collection, Product } from "@/lib/types";

type Row = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  details: string[];
  price: number;
  compare_at_price: number | null;
  categories: string[];
  collection_slug: string | null;
  color: string;
  is_new: boolean;
  featured: boolean;
  released_at: string;
  product_images: { url: string; alt: string; position: number }[];
  product_variants: { size: string; stock: number; position: number }[];
};

const SELECT =
  "id, slug, name, short_description, description, details, price, compare_at_price, categories, collection_slug, color, is_new, featured, released_at, product_images(url, alt, position), product_variants(size, stock, position)";

export function mapProduct(r: Row): Product {
  const variants = [...r.product_variants].sort((a, b) => a.position - b.position);
  const images = [...r.product_images].sort((a, b) => a.position - b.position);
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    shortDescription: r.short_description,
    description: r.description,
    details: r.details,
    price: Number(r.price),
    compareAtPrice: r.compare_at_price ? Number(r.compare_at_price) : undefined,
    categories: r.categories as CategorySlug[],
    collection: r.collection_slug,
    color: r.color,
    isNew: r.is_new,
    featured: r.featured,
    releasedAt: r.released_at,
    sizes: variants.map((v) => v.size),
    stock: Object.fromEntries(variants.map((v) => [v.size, v.stock])),
    soldOut: variants.filter((v) => v.stock <= 0).map((v) => v.size),
    images: images.length ? images.map((i) => ({ src: i.url, alt: i.alt || r.name })) : [{ src: "/placeholder.svg", alt: r.name }],
  };
}

/** Todos os produtos ativos (o catálogo é pequeno: cabe numa consulta). */
export const getProducts = cache(async (): Promise<Product[]> => {
  const { data, error } = await publicClient()
    .from("products")
    .select(SELECT)
    .eq("status", "active")
    .order("released_at", { ascending: false });
  if (error) throw new Error(`Erro ao carregar produtos: ${error.message}`);
  return (data as unknown as Row[]).map(mapProduct);
});

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
});

export const getCollections = cache(async (): Promise<Collection[]> => {
  const { data, error } = await publicClient()
    .from("collections")
    .select("slug, name, description, image_url")
    .order("position");
  if (error) throw new Error(`Erro ao carregar coleções: ${error.message}`);
  return (data ?? []).map((c) => ({ slug: c.slug, name: c.name, description: c.description, image: c.image_url }));
});
