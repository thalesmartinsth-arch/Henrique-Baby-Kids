import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { ImageManager } from "@/components/admin/ImageManager";
import { PageHeader, PRODUCT_STATUS, StatusBadge } from "@/components/admin/ui";
import type { CategorySlug } from "@/lib/types";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ novo?: string }> }) {
  const { id } = await params;
  const { novo } = await searchParams;
  const { supabase } = await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data: p }, { data: collections }] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_images(id, url, alt, position), product_variants(id, size, sku, stock, low_stock_threshold, position)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("collections").select("slug, name").order("position"),
  ]);
  if (!p) notFound();

  type Img = { id: string; url: string; alt: string; position: number };
  type Var = { id: string; size: string; sku: string | null; stock: number; low_stock_threshold: number; position: number };
  const images = [...(p.product_images as Img[])].sort((a, b) => a.position - b.position);
  const variants = [...(p.product_variants as Var[])].sort((a, b) => a.position - b.position);

  return (
    <>
      <Link href="/admin/produtos" className="mb-4 inline-flex items-center gap-1 text-[13px] text-navy-soft hover:text-navy">
        <ArrowLeft className="size-4" /> Produtos
      </Link>
      <PageHeader
        title={p.name}
        description={novo ? "Produto criado. Agora adicione as fotos e publique quando estiver pronto." : undefined}
        actions={
          <>
            <StatusBadge status={p.status} map={PRODUCT_STATUS} />
            {p.status === "active" && (
              <Link href={`/produto/${p.slug}`} target="_blank" className="btn btn-outline btn-sm">
                <ExternalLink className="size-3.5" /> Ver na loja
              </Link>
            )}
          </>
        }
      />
      <div className="mb-4">
        <ImageManager productId={p.id} productName={p.name} images={images} />
      </div>
      <ProductForm
        key={p.updated_at}
        collections={collections ?? []}
        initial={{
          id: p.id,
          name: p.name,
          slug: p.slug,
          short_description: p.short_description,
          description: p.description,
          details: p.details,
          price: Number(p.price),
          compare_at_price: p.compare_at_price === null ? null : Number(p.compare_at_price),
          cost_price: Number(p.cost_price),
          categories: p.categories as CategorySlug[],
          collection_slug: p.collection_slug,
          color: p.color,
          is_new: p.is_new,
          featured: p.featured,
          status: p.status,
          released_at: p.released_at,
          variants: variants.map((v) => ({ id: v.id, size: v.size, sku: v.sku, stock: v.stock, low_stock_threshold: v.low_stock_threshold })),
        }}
      />
    </>
  );
}
