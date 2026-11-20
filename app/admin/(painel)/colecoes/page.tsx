import { requireAdmin } from "@/lib/supabase/server";
import { CollectionManager } from "@/components/admin/CollectionManager";
import { PageHeader } from "@/components/admin/ui";

export default async function CollectionsAdminPage() {
  const { supabase } = await requireAdmin();
  const [{ data: cols }, { data: prods }] = await Promise.all([
    supabase.from("collections").select("slug, name, description, image_url, position").order("position"),
    supabase.from("products").select("collection_slug").neq("status", "archived"),
  ]);
  const count = (slug: string) => (prods ?? []).filter((p) => p.collection_slug === slug).length;
  return (
    <>
      <PageHeader title="Coleções" description="Aparecem na página Coleções da loja e no cadastro de produtos." />
      <CollectionManager collections={(cols ?? []).map((c) => ({ ...c, count: count(c.slug) }))} />
    </>
  );
}
