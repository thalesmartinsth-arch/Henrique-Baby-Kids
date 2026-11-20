import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { Breadcrumbs } from "@/components/shop/PageHero";
import { getCategory, getRelated } from "@/lib/catalog";
import { getProductBySlug, getProducts } from "@/lib/data/catalog";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.shortDescription} ${product.description.slice(0, 120)}…`,
    openGraph: { images: [{ url: product.images[0].src }] },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategory(product.categories[0]);
  const related = getRelated(await getProducts(), product, 8);

  // Dados estruturados para SEO (Google Shopping / rich results).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.src),
    color: product.color,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price.toFixed(2),
      availability: Object.values(product.stock).some((n) => n > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="wrap pt-6 lg:pt-8">
        <Breadcrumbs
          items={[
            { label: "Início", href: "/" },
            ...(category ? [{ label: category.name, href: `/loja/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 xl:gap-24">
          <ProductGallery images={product.images} name={product.name} />
          <ProductDetails product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 overflow-hidden border-t border-line bg-white py-20 lg:mt-32 lg:py-24" aria-labelledby="related-title">
          <div className="wrap">
            <p className="eyebrow">Combine com</p>
            <h2 id="related-title" className="display mb-12 mt-4 text-[40px] sm:text-5xl">
              Produtos <em className="text-sky-deep">relacionados</em>
            </h2>
            <ProductCarousel products={related} label="Produtos relacionados" />
          </div>
        </section>
      )}
    </>
  );
}
