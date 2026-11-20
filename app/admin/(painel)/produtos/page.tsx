import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { cn, formatPrice } from "@/lib/format";
import { getCategory } from "@/lib/catalog";
import { EmptyState, PageHeader, PRODUCT_STATUS, StatusBadge } from "@/components/admin/ui";

type Row = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  cost_price: number;
  status: string;
  categories: string[];
  product_images: { url: string; position: number }[];
  product_variants: { stock: number; low_stock_threshold: number }[];
};

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q = "", status = "" } = await searchParams;
  const { supabase } = await requireAdmin();
  let query = supabase
    .from("products")
    .select("id, name, slug, price, compare_at_price, cost_price, status, categories, product_images(url, position), product_variants(stock, low_stock_threshold)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (q.trim()) query = query.ilike("name", `%${q.trim()}%`);
  const { data } = await query;
  const products = (data ?? []) as unknown as Row[];

  const tabs = [
    { value: "", label: "Todos" },
    { value: "active", label: "Ativos" },
    { value: "draft", label: "Rascunhos" },
    { value: "archived", label: "Arquivados" },
  ];

  return (
    <>
      <PageHeader
        title="Produtos"
        description={`${products.length} ${products.length === 1 ? "produto" : "produtos"}`}
        actions={
          <Link href="/admin/produtos/novo" className="btn btn-primary btn-sm">
            <Plus className="size-4" /> Novo produto
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Filtrar por status" className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <Link
              key={t.value}
              href={`/admin/produtos?${new URLSearchParams({ ...(q && { q }), ...(t.value && { status: t.value }) })}`}
              className={cn(
                "inline-flex min-h-9 items-center rounded-[4px] px-3 text-[13px] font-semibold transition-colors",
                status === t.value ? "bg-navy text-white" : "text-navy-soft hover:bg-white hover:text-navy",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form className="relative sm:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy/40" />
          <label htmlFor="q" className="sr-only">Buscar produto</label>
          <input id="q" name="q" defaultValue={q} placeholder="Buscar pelo nome" className="adm-input pl-9" />
        </form>
      </div>

      {products.length ? (
        <div className="adm-card overflow-x-auto p-0 sm:p-0">
          <table className="adm-table min-w-[760px]">
            <thead>
              <tr>
                <th className="pl-5">Produto</th>
                <th>Status</th>
                <th>Categorias</th>
                <th className="text-right">Preço</th>
                <th className="text-right">Margem</th>
                <th className="pr-5 text-right">Estoque</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = [...p.product_images].sort((a, b) => a.position - b.position)[0]?.url;
                const stock = p.product_variants.reduce((s, v) => s + v.stock, 0);
                const lowCount = p.product_variants.filter((v) => v.stock <= v.low_stock_threshold).length;
                const margin = p.price > 0 ? ((p.price - p.cost_price) / p.price) * 100 : 0;
                return (
                  <tr key={p.id}>
                    <td className="pl-5">
                      <Link href={`/admin/produtos/${p.id}`} className="group flex items-center gap-3">
                        <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-[3px] bg-mist">
                          {img && <Image src={img} alt="" fill sizes="44px" className="object-cover" />}
                        </span>
                        <span className="font-semibold group-hover:underline">{p.name}</span>
                      </Link>
                    </td>
                    <td>
                      <StatusBadge status={p.status} map={PRODUCT_STATUS} />
                    </td>
                    <td className="text-navy-soft">{p.categories.map((c) => getCategory(c)?.name ?? c).join(", ")}</td>
                    <td className="text-right tabular-nums">
                      {p.compare_at_price && <span className="mr-1 text-navy/40 line-through">{formatPrice(Number(p.compare_at_price))}</span>}
                      <span className="font-semibold">{formatPrice(Number(p.price))}</span>
                    </td>
                    <td className="text-right tabular-nums text-navy-soft">{margin.toFixed(0)}%</td>
                    <td className="pr-5 text-right tabular-nums">
                      <span className={cn("font-semibold", stock === 0 && "text-rose-deep")}>{stock}</span>
                      {lowCount > 0 && <span className="ml-2 text-[11px] text-rose-deep">{lowCount} tam. baixo</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Nenhum produto encontrado">
          <Link href="/admin/produtos/novo" className="link-underline font-semibold">Cadastrar o primeiro produto</Link>
        </EmptyState>
      )}
    </>
  );
}
