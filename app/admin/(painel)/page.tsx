import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { daysAgo, formatPrice } from "@/lib/format";
import { BarChart, dailySeries } from "@/components/admin/BarChart";
import { EmptyState, PageHeader, StatCard, StatusBadge, fmtDateTime } from "@/components/admin/ui";

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const since = daysAgo(30).toISOString();

  const [{ data: orders }, { data: recent }, { data: variants }, { data: items }] = await Promise.all([
    supabase.from("orders").select("created_at, total, status").gte("created_at", since).neq("status", "cancelled"),
    supabase.from("orders").select("id, number, customer_name, total, status, created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("product_variants").select("id, size, stock, low_stock_threshold, products!inner(id, name, status)").eq("products.status", "active"),
    supabase.from("order_items").select("quantity, orders!inner(created_at, status)").gte("orders.created_at", since).neq("orders.status", "cancelled"),
  ]);

  const revenue = (orders ?? []).reduce((s, o) => s + Number(o.total), 0);
  const count = orders?.length ?? 0;
  const pieces = (items ?? []).reduce((s, i) => s + i.quantity, 0);
  const pending = (orders ?? []).filter((o) => o.status === "pending").length;
  type VariantRow = { id: string; size: string; stock: number; low_stock_threshold: number; products: { id: string; name: string } };
  const low = ((variants ?? []) as unknown as VariantRow[])
    .filter((v) => v.stock <= v.low_stock_threshold)
    .sort((a, b) => a.stock - b.stock);
  const series = dailySeries(orders ?? [], 30);

  return (
    <>
      <PageHeader title="Visão geral" description="Últimos 30 dias, sem pedidos cancelados." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Faturamento" value={formatPrice(revenue)} tone="sky" />
        <StatCard label="Pedidos" value={String(count)} hint={pending ? `${pending} aguardando pagamento` : undefined} />
        <StatCard label="Ticket médio" value={formatPrice(count ? revenue / count : 0)} />
        <StatCard label="Peças vendidas" value={String(pieces)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="adm-card" aria-labelledby="chart-title">
          <h2 id="chart-title" className="adm-h2 mb-6">Faturamento por dia</h2>
          <BarChart data={series} />
        </section>

        <section className="adm-card" aria-labelledby="low-title">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="low-title" className="adm-h2 flex items-center gap-2">
              <AlertTriangle className="size-4 text-rose-deep" /> Estoque baixo
            </h2>
            <Link href="/admin/estoque?baixo=1" className="link-underline text-[12px] font-semibold">
              Ver estoque
            </Link>
          </div>
          {low.length ? (
            <ul className="max-h-[230px] divide-y divide-line overflow-y-auto">
              {low.slice(0, 12).map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                  <Link href={`/admin/produtos/${v.products.id}`} className="min-w-0 truncate hover:underline">
                    {v.products.name} <span className="text-navy-soft">· {v.size}</span>
                  </Link>
                  <span className={v.stock === 0 ? "font-semibold text-rose-deep" : "font-semibold"}>{v.stock === 0 ? "Esgotado" : `${v.stock} un.`}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-soft">Nenhum tamanho abaixo do mínimo.</p>
          )}
        </section>
      </div>

      <section className="adm-card mt-4" aria-labelledby="recent-title">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-title" className="adm-h2">Pedidos recentes</h2>
          <Link href="/admin/pedidos" className="group inline-flex items-center gap-1 text-[12px] font-semibold">
            Todos os pedidos <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        {recent?.length ? (
          <div className="-mx-5 overflow-x-auto sm:-mx-6">
            <table className="adm-table min-w-[560px]">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/pedidos/${o.id}`} className="font-semibold hover:underline">
                        #{o.number}
                      </Link>
                    </td>
                    <td>{o.customer_name}</td>
                    <td className="text-navy-soft">{fmtDateTime(o.created_at)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="text-right font-semibold tabular-nums">{formatPrice(Number(o.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Nenhum pedido ainda">Os pedidos feitos na loja aparecem aqui.</EmptyState>
        )}
      </section>
    </>
  );
}
