import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: collections } = await supabase.from("collections").select("slug, name").order("position");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Link href="/admin/produtos" className="mb-4 inline-flex items-center gap-1 text-[13px] text-navy-soft hover:text-navy">
        <ArrowLeft className="size-4" /> Produtos
      </Link>
      <PageHeader title="Novo produto" description="Depois de criar, você adiciona as fotos." />
      <ProductForm
        collections={collections ?? []}
        initial={{
          name: "",
          slug: "",
          short_description: "",
          description: "",
          details: [],
          price: 0,
          compare_at_price: null,
          cost_price: 0,
          categories: [],
          collection_slug: null,
          color: "",
          is_new: true,
          featured: false,
          status: "draft",
          released_at: today,
          variants: [],
        }}
      />
    </>
  );
}
