import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { EmptyState, PageHeader, StatCard, fmtDate } from "@/components/admin/ui";

type Customer = { email: string; name: string; phone: string; orders: number; total: number; last: string; lastId: string };

export default async function CustomersPage() {
  const { supabase } = await requireAdmin();
  const [{ data: orders }, { data: subs }] = await Promise.all([
    supabase.from("orders").select("id, customer_email, customer_name, customer_phone, total, created_at, status").neq("status", "cancelled").order("created_at", { ascending: false }),
    supabase.from("newsletter_subscribers").select("email, created_at").order("created_at", { ascending: false }),
  ]);

  const map = new Map<string, Customer>();
  for (const o of orders ?? []) {
    const c = map.get(o.customer_email) ?? { email: o.customer_email, name: o.customer_name, phone: o.customer_phone, orders: 0, total: 0, last: o.created_at, lastId: o.id };
    c.orders += 1;
    c.total += Number(o.total);
    map.set(o.customer_email, c);
  }
  const customers = [...map.values()].sort((a, b) => b.total - a.total);
  const repeat = customers.filter((c) => c.orders > 1).length;

  return (
    <>
      <PageHeader title="Clientes" description="Montado a partir dos pedidos e da newsletter." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Clientes" value={String(customers.length)} />
        <StatCard label="Compraram mais de uma vez" value={String(repeat)} />
        <StatCard label="Valor médio por cliente" value={formatPrice(customers.length ? customers.reduce((s, c) => s + c.total, 0) / customers.length : 0)} />
        <StatCard label="Inscritos na newsletter" value={String(subs?.length ?? 0)} tone="sky" />
      </div>

      <section className="adm-card mt-6 overflow-x-auto p-0 sm:p-0">
        {customers.length ? (
          <table className="adm-table min-w-[680px]">
            <thead>
              <tr><th className="pl-5">Cliente</th><th>Telefone</th><th className="text-right">Pedidos</th><th className="text-right">Total gasto</th><th className="pr-5">Último pedido</th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email}>
                  <td className="pl-5"><span className="font-semibold">{c.name}</span><span className="block text-[11px] text-navy-soft">{c.email}</span></td>
                  <td className="text-navy-soft">{c.phone}</td>
                  <td className="text-right tabular-nums">{c.orders}</td>
                  <td className="text-right font-semibold tabular-nums">{formatPrice(c.total)}</td>
                  <td className="pr-5"><Link href={`/admin/pedidos/${c.lastId}`} className="hover:underline">{fmtDate(c.last)}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-6"><EmptyState title="Nenhum cliente ainda">Os clientes aparecem aqui após o primeiro pedido.</EmptyState></div>
        )}
      </section>

      <section className="adm-card mt-6">
        <h2 className="adm-h2 mb-4">Newsletter ({subs?.length ?? 0})</h2>
        {subs?.length ? (
          <ul className="grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-2 lg:grid-cols-3">
            {subs.map((s) => (
              <li key={s.email} className="flex justify-between gap-2 border-b border-line/60 py-1.5"><span className="truncate">{s.email}</span><span className="shrink-0 text-navy-soft">{fmtDate(s.created_at)}</span></li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-navy-soft">Ninguém se inscreveu ainda.</p>
        )}
      </section>
    </>
  );
}
