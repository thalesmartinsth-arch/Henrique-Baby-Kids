"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { adjustStock } from "@/app/admin/actions";
import { useAction } from "./useAction";

export function StockAdjust({ variantId, label }: { variantId: string; label: string }) {
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState<"restock" | "adjustment" | "return">("restock");
  const { pending, run } = useAction();

  const apply = (sign: 1 | -1) =>
    run(() => adjustStock(variantId, sign * qty, sign === -1 && reason === "restock" ? "adjustment" : reason, ""), {
      success: sign === 1 ? `+${qty} em ${label}` : `-${qty} em ${label}`,
    });

  return (
    <div className="flex items-center justify-end gap-1.5">
      <label className="sr-only" htmlFor={`r-${variantId}`}>Motivo</label>
      <select id={`r-${variantId}`} value={reason} onChange={(e) => setReason(e.target.value as typeof reason)} className="adm-input h-9 w-auto px-2 text-[12px]">
        <option value="restock">Entrada</option>
        <option value="return">Devolução</option>
        <option value="adjustment">Ajuste</option>
      </select>
      <label className="sr-only" htmlFor={`q-${variantId}`}>Quantidade</label>
      <input
        id={`q-${variantId}`}
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
        className="adm-input h-9 w-16 px-2 text-center"
      />
      <button type="button" disabled={pending} onClick={() => apply(-1)} aria-label={`Retirar ${qty} de ${label}`} className="grid size-9 place-items-center rounded-[4px] border border-line hover:border-navy disabled:opacity-40">
        <Minus className="size-3.5" />
      </button>
      <button type="button" disabled={pending} onClick={() => apply(1)} aria-label={`Adicionar ${qty} a ${label}`} className="grid size-9 place-items-center rounded-[4px] bg-navy text-white hover:bg-[#1c2d42] disabled:opacity-40">
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
