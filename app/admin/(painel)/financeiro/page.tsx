import Link from "next/link";
import { requireAdmin } from "@/lib/supabase/server";
import { cn, daysAgo, formatPrice } from "@/lib/format";
import { BarChart, dailySeries } from "@/components/admin/BarChart";
import { DeleteExpenseButton, EXPENSE_CATEGORIES, ExpenseForm } from "@/components/admin/ExpenseForm";
import { EmptyState, PAYMENT_LABEL, PageHeader, StatCard, fmtDate } from "@/components/admin/ui";

const PERIODS = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
  { value: "365", label: "12 meses" },
];

type OrderRow = {
  id: string;
  created_at: string;
  status: string;
  subtotal: number;
  discount: number;
  pix_discount: number;
  shipping: number;
  total: number;
  payment_method: string;
  order_items: { product_name: string; quantity: number; unit_price: number; unit_cost: number }[];
};

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p = "30" } = await searchParams;
  const days = PERIODS.some((x) => x.value === p) ? Number(p) : 30;
  const since = daysAgo(days);
  const { supabase } = await requireAdmin();

  const [{ data: oData }, { data: expenses }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, created_at, status, subtotal, discount, pix_discount, shipping, total, payment_method, order_items(product_name, quantity, unit_price, unit_cost)")
      .gte("created_at", since.toISOString())
      .neq("status", "cancelled"),
    supabase.from("expenses").select("*").gte("spent_on", since.toISOString().slice(0, 10)).order("spent_on", { ascending: false }),
  ]);
  const orders = (oData ?? []) as unknown as OrderRow[];
  const confirmed = orders.filter((o) => o.status !== "pending");

  const sum = (rows: OrderRow[], k: keyof OrderRow) => rows.reduce((s, o) => s + Number(o[k]), 0);
  const gross = sum(confirmed, "subtotal");
  const discounts = sum(confirmed, "discount") + sum(confirmed, "pix_discount");
  const shipping = sum(confirmed, "shipping");
  const revenue = sum(confirmed, "total");
  const cogs = confirmed.reduce((s, o) => s + o.order_items.reduce((t, i) => t + Number(i.unit_cost) * i.quantity, 0), 0);
  const grossProfit = revenue - shipping - cogs;
  const expenseTotal = (expenses ?? []).reduce((s, e) => s + Number(e.amount), 0);
  const result = grossProfit - expenseTotal;
  const pendingTotal = sum(
    orders.filter((o) => o.status === "pending"),
    "total",
  );

  const byPayment = Object.entries(
    confirmed.reduce<Record<string, { count: number; total: number }>>((acc, o) => {
      acc[o.payment_method] ??= { count: 0, total: 0 };
      acc[o.payment_method].count += 1;
      acc[o.payment_method].total += Number(o.total);
      return acc;
    }, {}),
  ).sort((a, b) => b[1].total - a[1].total);

  const top = Object.entries(
    confirmed
      .flatMap((o) => o.order_items)
      .reduce<Record<string, { qty: number; revenue: number; profit: number }>>((acc, i) => {
        acc[i.product_name] ??= { qty: 0, revenue: 0, profit: 0 };
        acc[i.product_name].qty += i.quantity;
        acc[i.product_name].revenue += Number(i.unit_price) * i.quantity;
        acc[i.product_name].profit += (Number(i.unit_price) - Number(i.unit_cost)) * i.quantity;
        return acc;
      }, {}),
  )
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 8);

  const expenseByCat = Object.entries(
    (expenses ?? []).reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader
        title="Financeiro"
        description="Considera pedidos pagos, enviados e entregues. Pedidos aguardando pagamento aparecem à parte."
        actions={
          <nav aria-label="Período" className="flex gap-1 rounded-[4px] bg-white p-1">
            {PERIODS.map((x) => (
              <Link
                key={x.value}
                href={`/admin/financeiro?p=${x.value}`}
                className={cn("inline-flex min-h-9 items-center rounded-[3px] px-3 text-[12px] font-semibold", String(days) === x.value ? "bg-navy text-white" : "text-navy-soft hover:text-navy")}
              >
                {x.label}
              </Link>
            ))}
          </nav>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatCard label="Receita líquida" value={formatPrice(revenue)} hint={`${confirmed.length} pedidos confirmados`} tone="sky" />
        <StatCard label="Lucro bruto" value={formatPrice(grossProfit)} hint="Receita − frete − custo das peças" />
        <StatCard label="Despesas" value={formatPrice(expenseTotal)} />
        <StatCard label="Resultado" value={formatPrice(result)} tone={result < 0 ? "rose" : "default"} hint={revenue ? `Margem ${((result / revenue) * 100).toFixed(1)}%` : undefined} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="adm-card">
          <h2 className="adm-h2 mb-6">Receita por dia</h2>
          <BarChart data={dailySeries(confirmed, Math.min(days, 90))} />
        </section>
        <section className="adm-card text-[13px]">
          <h2 className="adm-h2 mb-4">Demonstrativo</h2>
          <dl className="space-y-2">
            <div className="flex justify-between"><dt className="text-navy-soft">Vendas brutas</dt><dd className="tabular-nums">{formatPrice(gross)}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-soft">(−) Descontos e cupons</dt><dd className="tabular-nums text-rose-deep">-{formatPrice(discounts)}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-soft">(+) Frete cobrado</dt><dd className="tabular-nums">{formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>Receita líquida</dt><dd className="tabular-nums">{formatPrice(revenue)}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-soft">(−) Custo das peças vendidas</dt><dd className="tabular-nums text-rose-deep">-{formatPrice(cogs)}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-soft">(−) Frete repassado</dt><dd className="tabular-nums text-rose-deep">-{formatPrice(shipping)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 font-semibold"><dt>Lucro bruto</dt><dd className="tabular-nums">{formatPrice(grossProfit)}</dd></div>
            <div className="flex justify-between"><dt className="text-navy-soft">(−) Despesas</dt><dd className="tabular-nums text-rose-deep">-{formatPrice(expenseTotal)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-[15px] font-semibold"><dt>Resultado</dt><dd className={cn("tabular-nums", result < 0 && "text-rose-deep")}>{formatPrice(result)}</dd></div>
          </dl>
          {pendingTotal > 0 && <p className="mt-4 rounded-[3px] bg-amber-50 px-3 py-2 text-[12px] text-amber-900">{formatPrice(pendingTotal)} em pedidos aguardando pagamento.</p>}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="adm-card">
          <h2 className="adm-h2 mb-4">Mais vendidos</h2>
          {top.length ? (
            <div className="-mx-5 overflow-x-auto sm:-mx-6">
              <table className="adm-table min-w-[420px]">
                <thead><tr><th className="pl-5">Produto</th><th className="text-right">Peças</th><th className="text-right">Receita</th><th className="pr-5 text-right">Lucro</th></tr></thead>
                <tbody>
                  {top.map(([name, t]) => (
                    <tr key={name}>
                      <td className="pl-5">{name}</td>
                      <td className="text-right tabular-nums">{t.qty}</td>
                      <td className="text-right tabular-nums">{formatPrice(t.revenue)}</td>
                      <td className="pr-5 text-right tabular-nums text-navy-soft">{formatPrice(t.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-navy-soft">Sem vendas confirmadas no período.</p>
          )}
        </section>
        <section className="adm-card">
          <h2 className="adm-h2 mb-4">Formas de pagamento</h2>
          {byPayment.length ? (
            <ul className="space-y-3">
              {byPayment.map(([method, v]) => (
                <li key={method}>
                  <div className="flex justify-between text-[13px]">
                    <span>{PAYMENT_LABEL[method] ?? method} <span className="text-navy-soft">· {v.count} pedidos</span></span>
                    <span className="font-semibold tabular-nums">{formatPrice(v.total)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky to-rose" style={{ width: `${(v.total / revenue) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-soft">Sem vendas confirmadas no período.</p>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <section className="adm-card">
          <h2 className="adm-h2 mb-4">Lançar despesa</h2>
          <ExpenseForm />
          {expenseByCat.length > 0 && (
            <ul className="mt-6 space-y-1.5 border-t border-line pt-4 text-[13px]">
              {expenseByCat.map(([cat, v]) => (
                <li key={cat} className="flex justify-between"><span className="text-navy-soft">{EXPENSE_CATEGORIES[cat] ?? cat}</span><span className="tabular-nums">{formatPrice(v)}</span></li>
              ))}
            </ul>
          )}
        </section>
        <section className="adm-card">
          <h2 className="adm-h2 mb-4">Despesas do período</h2>
          {expenses?.length ? (
            <div className="-mx-5 overflow-x-auto sm:-mx-6">
              <table className="adm-table min-w-[460px]">
                <thead><tr><th className="pl-5">Data</th><th>Descrição</th><th>Categoria</th><th className="text-right">Valor</th><th className="pr-5" /></tr></thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="pl-5 text-navy-soft">{fmtDate(e.spent_on)}</td>
                      <td>{e.description}</td>
                      <td className="text-navy-soft">{EXPENSE_CATEGORIES[e.category] ?? e.category}</td>
                      <td className="text-right tabular-nums">{formatPrice(Number(e.amount))}</td>
                      <td className="pr-5 text-right"><DeleteExpenseButton id={e.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Nenhuma despesa lançada">Registre compras, frete, anúncios e taxas para ver o resultado real.</EmptyState>
          )}
        </section>
      </div>
    </>
  );
}
