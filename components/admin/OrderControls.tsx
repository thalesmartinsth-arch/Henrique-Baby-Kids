"use client";

import { useState } from "react";
import { setOrderStatus, updateOrderNotes } from "@/app/admin/actions";
import { cn } from "@/lib/format";
import { ORDER_STATUS } from "./ui";
import { useAction } from "./useAction";

const FLOW = ["pending", "paid", "shipped", "delivered"] as const;

export function OrderStatusControl({ orderId, status }: { orderId: string; status: string }) {
  const { pending, run } = useAction();
  const cancelled = status === "cancelled";
  const currentIndex = FLOW.indexOf(status as (typeof FLOW)[number]);

  return (
    <div className="space-y-3">
      <ol className="grid grid-cols-4 gap-1" aria-label="Etapas do pedido">
        {FLOW.map((s, i) => {
          const done = !cancelled && i <= currentIndex;
          return (
            <li key={s}>
              <button
                type="button"
                disabled={pending || cancelled || s === status}
                onClick={() => run(() => setOrderStatus(orderId, s))}
                aria-current={s === status ? "step" : undefined}
                className={cn(
                  "w-full rounded-[4px] border px-2 py-2.5 text-center text-[11px] font-semibold leading-tight transition-colors",
                  done ? "border-navy bg-navy text-white" : "border-line bg-white text-navy-soft hover:border-navy hover:text-navy",
                  "disabled:cursor-default",
                )}
              >
                {ORDER_STATUS[s].label}
              </button>
            </li>
          );
        })}
      </ol>
      {cancelled ? (
        <p className="rounded-[3px] bg-mist px-3 py-2 text-[13px] text-navy-soft">Pedido cancelado. As peças voltaram ao estoque.</p>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => confirm("Cancelar este pedido? As peças voltam para o estoque.") && run(() => setOrderStatus(orderId, "cancelled"), { success: "Pedido cancelado" })}
          className="text-[12px] font-semibold text-rose-deep hover:underline"
        >
          Cancelar pedido
        </button>
      )}
    </div>
  );
}

export function OrderNotes({ orderId, notes, tracking }: { orderId: string; notes: string; tracking: string }) {
  const [n, setN] = useState(notes);
  const [t, setT] = useState(tracking);
  const { pending, run } = useAction();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => updateOrderNotes(orderId, n, t));
      }}
    >
      <div>
        <label htmlFor="tracking" className="adm-label">Código de rastreio</label>
        <input id="tracking" value={t} onChange={(e) => setT(e.target.value)} placeholder="Ex.: BR123456789BR" className="adm-input" />
      </div>
      <div>
        <label htmlFor="notes" className="adm-label">Anotações internas</label>
        <textarea id="notes" rows={3} value={n} onChange={(e) => setN(e.target.value)} className="adm-input h-auto py-2" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-outline btn-sm">
        {pending ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}
