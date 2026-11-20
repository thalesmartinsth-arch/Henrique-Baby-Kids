import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { cn, formatPrice } from "@/lib/format";
import { StockAdjust } from "@/components/admin/StockAdjust";
import { Badge, EmptyState, PageHeader, StatCard, fmtDateTime } from "@/components/admin/ui";

const REASON: Record<string, string> = {
  sale: "Venda",
  restock: "Entrada",
  adjustment: "Ajuste",
  return: "Devolução",
  cancel: "Cancelamento",
  initial: "Estoque inicial",
};

type VariantRow = {
  id: string;
  size: string;
  sku: string | null;
  stock: number;
  low_stock_threshold: number;
  position: number;
  products: { id: string; name: string; status: string; price: number; cost_price: number };
};

export default async function StockPage({ searchParams }: { searchParams: Promise<{ q?: string; baixo?: string }> }) {
  const { q = "", baixo } = await searchParams;
  const { supabase } = await requireAdmin();

  const [{ data: vData }, { data: moves }] = await Promise.all([
    supabase.from("product_variants").select("id, size, sku, stock, low_stock_threshold, position, products!inner(id, name, status, price, cost_price)").neq("products.status", "archived"),
    supabase
      .from("stock_movements")
      .select("id, delta, reason, note, created_by, created_at, product_variants(size, products(name))")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  const all = (vData ?? []) as unknown as VariantRow[];
  const units = all.reduce((s, v) => s + v.stock, 0);
  const costValue = all.reduce((s, v) => s + v.stock * Number(v.products.cost_price), 0);
  const saleValue = all.reduce((s, v) => s + v.stock * Number(v.products.price), 0);
  const lowCount = all.filter((v) => v.stock <= v.low_stock_threshold).length;

  const term = q.trim().toLowerCase();
  const rows = all
    .filter((v) => (!baixo || v.stock <= v.low_stock_threshold) && (!term || v.products.name.toLowerCase().includes(term) || v.sku?.toLowerCase().includes(term)))
    .sort((a, b) => a.products.name.localeCompare(b.products.name) || a.position - b.position);

  type Move = { id: string; delta: number; reason: string; note: string; created_by: string | null; created_at: string; product_variants: { size: string; products: { name: string } } | null };

  return (
    <>
      <PageHeader title="Estoque" description="Entradas, saídas e ajustes ficam registrados no histórico." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Peças em estoque" value={String(units)} />
        <StatCard label="Valor de custo" value={formatPrice(costValue)} />
        <StatCard label="Valor de venda" value={formatPrice(saleValue)} tone="sky" />
        <StatCard label="Tamanhos em alerta" value={String(lowCount)} tone={lowCount ? "rose" : "default"} />
      </div>

      <div className="mb-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex gap-1" aria-label="Filtro de estoque">
          <Link href={`/admin/estoque${q ? `?q=${encodeURIComponent(q)}` : ""}`} className={cn("inline-flex min-h-9 items-center rounded-[4px] px-3 text-[13px] font-semibold", !baixo ? "bg-navy text-white" : "text-navy-soft hover:bg-white")}>
            Todos
          </Link>
          <Link href={`/admin/estoque?baixo=1${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={cn("inline-flex min-h-9 items-center rounded-[4px] px-3 text-[13px] font-semibold", baixo ? "bg-navy text-white" : "text-navy-soft hover:bg-white")}>
            Estoque baixo
          </Link>
        </nav>
        <form className="relative sm:w-72">
          {baixo && <input type="hidden" name="baixo" value="1" />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy/40" />
          <label htmlFor="sq" className="sr-only">Buscar por produto ou SKU</label>
          <input id="sq" name="q" defaultValue={q} placeholder="Produto ou SKU" className="adm-input pl-9" />
        </form>
      </div>

      {rows.length ? (
        <div className="adm-card overflow-x-auto p-0 sm:p-0">
          <table className="adm-table min-w-[760px]">
            <thead>
              <tr>
                <th className="pl-5">Produto</th>
                <th>Tamanho</th>
                <th>SKU</th>
                <th className="text-right">Estoque</th>
                <th className="pr-5 text-right">Movimentar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td className="pl-5">
                    <Link href={`/admin/produtos/${v.products.id}`} className="font-semibold hover:underline">
                      {v.products.name}
                    </Link>
                    {v.products.status === "draft" && <span className="ml-2 text-[11px] text-navy-soft">(rascunho)</span>}
                  </td>
                  <td>{v.size}</td>
                  <td className="text-navy-soft">{v.sku ?? "—"}</td>
                  <td className="text-right">
                    {v.stock === 0 ? (
                      <Badge className="bg-blush text-rose-deep ring-rose/40">Esgotado</Badge>
                    ) : v.stock <= v.low_stock_threshold ? (
                      <Badge className="bg-amber-50 text-amber-800 ring-amber-200">{v.stock} · baixo</Badge>
                    ) : (
                      <span className="font-semibold tabular-nums">{v.stock}</span>
                    )}
                  </td>
                  <td className="pr-5">
                    <StockAdjust variantId={v.id} label={`${v.products.name} ${v.size}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Nada por aqui">Nenhum tamanho corresponde ao filtro.</EmptyState>
      )}

      <section className="adm-card mt-6" aria-labelledby="moves-title">
        <h2 id="moves-title" className="adm-h2 mb-4">Últimas movimentações</h2>
        <div className="-mx-5 overflow-x-auto sm:-mx-6">
          <table className="adm-table min-w-[620px]">
            <thead>
              <tr>
                <th className="pl-5">Quando</th>
                <th>Produto</th>
                <th>Motivo</th>
                <th>Por</th>
                <th className="pr-5 text-right">Qtd.</th>
              </tr>
            </thead>
            <tbody>
              {((moves ?? []) as unknown as Move[]).map((m) => (
                <tr key={m.id}>
                  <td className="pl-5 text-navy-soft">{fmtDateTime(m.created_at)}</td>
                  <td>
                    {m.product_variants?.products.name ?? "Removido"} <span className="text-navy-soft">· {m.product_variants?.size}</span>
                  </td>
                  <td>
                    {REASON[m.reason] ?? m.reason}
                    {m.note && <span className="block text-[11px] text-navy-soft">{m.note}</span>}
                  </td>
                  <td className="text-navy-soft">{m.created_by ?? (m.reason === "sale" ? "Loja" : "—")}</td>
                  <td className={cn("pr-5 text-right font-semibold tabular-nums", m.delta < 0 ? "text-rose-deep" : "text-emerald-700")}>
                    {m.delta > 0 ? `+${m.delta}` : m.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
