import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageHero } from "@/components/shop/PageHero";
import { ProductListing } from "@/components/shop/ProductListing";
import { CATEGORIES, getCategory } from "@/lib/catalog";
import { getProducts } from "@/lib/data/catalog";
import type { Product } from "@/lib/types";
import { photo, PHOTOS } from "@/lib/images";
import type { CategorySlug } from "@/lib/types";

const SPECIAL = {
  novidades: {
    title: "Novidades",
    eyebrow: "New collection",
    description: "Os lançamentos mais recentes, em tiragens pequenas.",
    image: photo(PHOTOS.heroMeadow),
    filter: (all: Product[]) => all.filter((p) => p.isNew),
  },
  promocoes: {
    title: "Promoções",
    eyebrow: "Por tempo limitado",
    description: "Peças selecionadas com preço especial enquanto durarem os tamanhos.",
    image: photo(PHOTOS.heroPair),
    filter: (all: Product[]) => all.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price),
  },
} as const;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...CATEGORIES.map((c) => ({ slug: c.slug })), { slug: "novidades" }, { slug: "promocoes" }];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const special = SPECIAL[slug as keyof typeof SPECIAL];
  const category = getCategory(slug);
  const title = special?.title ?? category?.name;
  if (!title) return {};
  return { title, description: special?.description ?? `${category?.tagline}. Moda infantil premium na Henrique Baby & Kids.` };
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params;
  const special = SPECIAL[slug as keyof typeof SPECIAL];
  const category = getCategory(slug);
  if (!special && !category) notFound();

  const all = await getProducts();
  const products = special ? special.filter(all) : all.filter((p) => p.categories.includes(slug as CategorySlug));
  const title = special?.title ?? category!.name;

  return (
    <>
      <PageHero
        eyebrow={special?.eyebrow ?? "Categoria"}
        title={title}
        description={special?.description ?? category!.tagline}
        image={special?.image ?? category!.image}
        crumbs={[{ label: "Início", href: "/" }, { label: "Loja", href: "/loja" }, { label: title }]}
      />
      <Suspense>
        <ProductListing products={products} lockedCategory={category?.slug} />
      </Suspense>
    </>
  );
}
