import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdmin } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { OrderNotes, OrderStatusControl } from "@/components/admin/OrderControls";
import { PAYMENT_LABEL, StatusBadge, fmtDateTime } from "@/components/admin/ui";

type Address = { cep: string; street: string; number: string; complement?: string; district: string; city: string; state: string };
type Item = { id: string; product_id: string | null; product_name: string; product_image: string | null; size: string; unit_price: number; unit_cost: number; quantity: number };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data: o } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!o) notFound();

  const items = o.order_items as Item[];
  const a = o.address as Address;
  const cost = items.reduce((s, i) => s + Number(i.unit_cost) * i.quantity, 0);
  const profit = Number(o.total) - Number(o.shipping) - cost;

  return (
    <>
      <Link href="/admin/pedidos" className="mb-4 inline-flex items-center gap-1 text-[13px] text-navy-soft hover:text-navy">
        <ArrowLeft className="size-4" /> Pedidos
      </Link>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="adm-title">Pedido #{o.number}</h1>
        <StatusBadge status={o.status} />
        <span className="text-sm text-navy-soft">{fmtDateTime(o.created_at)}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="adm-card">
            <h2 className="adm-h2 mb-4">Andamento</h2>
            <OrderStatusControl orderId={o.id} status={o.status} />
          </section>

          <section className="adm-card">
            <h2 className="adm-h2 mb-2">Itens</h2>
            <ul className="divide-y divide-line">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[3px] bg-mist">
                    {i.product_image && <Image src={i.product_image} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1 text-[13px]">
                    {i.product_id ? (
                      <Link href={`/admin/produtos/${i.product_id}`} className="font-semibold hover:underline">{i.product_name}</Link>
                    ) : (
                      <p className="font-semibold">{i.product_name}</p>
                    )}
                    <p className="text-navy-soft">Tam. {i.size} · {i.quantity} × {formatPrice(Number(i.unit_price))}</p>
                  </div>
                  <p className="text-[14px] font-semibold tabular-nums">{formatPrice(Number(i.unit_price) * i.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[13px]">
              <div className="flex justify-between"><dt className="text-navy-soft">Subtotal</dt><dd className="tabular-nums">{formatPrice(Number(o.subtotal))}</dd></div>
              {Number(o.discount) > 0 && <div className="flex justify-between text-rose-deep"><dt>Cupom {o.coupon_code}</dt><dd className="tabular-nums">-{formatPrice(Number(o.discount))}</dd></div>}
              <div className="flex justify-between"><dt className="text-navy-soft">Frete</dt><dd className="tabular-nums">{Number(o.shipping) ? formatPrice(Number(o.shipping)) : "Grátis"}</dd></div>
              {Number(o.pix_discount) > 0 && <div className="flex justify-between text-rose-deep"><dt>Desconto Pix</dt><dd className="tabular-nums">-{formatPrice(Number(o.pix_discount))}</dd></div>}
              <div className="flex justify-between border-t border-line pt-2 text-[15px] font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(Number(o.total))}</dd></div>
              <div className="flex justify-between text-[12px] text-navy-soft"><dt>Custo das peças · lucro bruto</dt><dd className="tabular-nums">{formatPrice(cost)} · {formatPrice(profit)}</dd></div>
            </dl>
          </section>
        </div>

        <div className="space-y-4">
          <section className="adm-card text-[13px]">
            <h2 className="adm-h2 mb-3">Cliente</h2>
            <p className="font-semibold">{o.customer_name}</p>
            <p><a href={`mailto:${o.customer_email}`} className="hover:underline">{o.customer_email}</a></p>
            <p className="text-navy-soft">{o.customer_phone}</p>
            <h3 className="adm-h2 mb-2 mt-5">Entrega</h3>
            <p>{a.street}, {a.number}{a.complement ? ` — ${a.complement}` : ""}</p>
            <p>{a.district} · {a.city}/{a.state}</p>
            <p className="text-navy-soft">CEP {a.cep}</p>
            <h3 className="adm-h2 mb-2 mt-5">Pagamento</h3>
            <p>{PAYMENT_LABEL[o.payment_method] ?? o.payment_method}</p>
          </section>
          <section className="adm-card">
            <h2 className="adm-h2 mb-3">Envio e anotações</h2>
            <OrderNotes orderId={o.id} notes={o.admin_notes} tracking={o.tracking_code ?? ""} />
          </section>
        </div>
      </div>
    </>
  );
}
