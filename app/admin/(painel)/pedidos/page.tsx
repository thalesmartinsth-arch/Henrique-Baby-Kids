import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { cn, formatPrice } from "@/lib/format";
import { EmptyState, ORDER_STATUS, PAYMENT_LABEL, PageHeader, StatusBadge, fmtDateTime } from "@/components/admin/ui";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status = "", q = "" } = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("orders")
    .select("id, number, customer_name, customer_email, total, status, payment_method, created_at, order_items(quantity)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  const term = q.trim();
  if (term) {
    query = /^\d+$/.test(term) ? query.eq("number", Number(term)) : query.or(`customer_name.ilike.%${term.replace(/[,()]/g, " ")}%,customer_email.ilike.%${term.replace(/[,()]/g, " ")}%`);
  }
  const { data: orders } = await query;

  const tabs = [{ value: "", label: "Todos" }, ...Object.entries(ORDER_STATUS).map(([value, s]) => ({ value, label: s.label }))];

  return (
    <>
      <PageHeader title="Pedidos" description="Mude o status conforme o pedido avança. Cancelar devolve as peças ao estoque." />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filtrar por status" className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <Link
              key={t.value}
              href={`/admin/pedidos?${new URLSearchParams({ ...(t.value && { status: t.value }), ...(q && { q }) })}`}
              className={cn(
                "inline-flex min-h-9 items-center rounded-[4px] px-3 text-[13px] font-semibold transition-colors",
                status === t.value ? "bg-navy text-white" : "text-navy-soft hover:bg-white hover:text-navy",
              )}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <form className="relative lg:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy/40" />
          <label htmlFor="oq" className="sr-only">Buscar pedido</label>
          <input id="oq" name="q" defaultValue={q} placeholder="Nº, nome ou e-mail" className="adm-input pl-9" />
        </form>
      </div>

      {orders?.length ? (
        <div className="adm-card overflow-x-auto p-0 sm:p-0">
          <table className="adm-table min-w-[760px]">
            <thead>
              <tr>
                <th className="pl-5">Pedido</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Pagamento</th>
                <th>Status</th>
                <th>Peças</th>
                <th className="pr-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="pl-5">
                    <Link href={`/admin/pedidos/${o.id}`} className="font-semibold hover:underline">
                      #{o.number}
                    </Link>
                  </td>
                  <td className="text-navy-soft">{fmtDateTime(o.created_at)}</td>
                  <td>
                    {o.customer_name}
                    <span className="block text-[11px] text-navy-soft">{o.customer_email}</span>
                  </td>
                  <td>{PAYMENT_LABEL[o.payment_method] ?? o.payment_method}</td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="tabular-nums">{(o.order_items as { quantity: number }[]).reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="pr-5 text-right font-semibold tabular-nums">{formatPrice(Number(o.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Nenhum pedido encontrado">Quando alguém comprar na loja, o pedido aparece aqui.</EmptyState>
      )}
    </>
  );
}
