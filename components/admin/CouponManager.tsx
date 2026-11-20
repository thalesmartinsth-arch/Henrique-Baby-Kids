"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteCoupon, saveCoupon, toggleCoupon } from "@/app/admin/actions";
import { formatPrice, nowMs } from "@/lib/format";
import { Badge, fmtDate } from "./ui";
import { useAction } from "./useAction";

export type CouponRow = {
  code: string;
  description: string;
  percent: number;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  used_count: number;
  min_subtotal: number;
};

const blank = { code: "", description: "", percent: "10", max_uses: "", min_subtotal: "", starts_at: "", ends_at: "" };

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const [f, setF] = useState(blank);
  const { pending, run } = useAction();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () =>
        saveCoupon(
          {
            code: f.code,
            description: f.description,
            percent: Number(f.percent),
            max_uses: f.max_uses ? Number(f.max_uses) : null,
            min_subtotal: f.min_subtotal ? Number(f.min_subtotal.replace(",", ".")) : 0,
            starts_at: f.starts_at ? new Date(`${f.starts_at}T00:00:00-03:00`).toISOString() : null,
            ends_at: f.ends_at ? new Date(`${f.ends_at}T23:59:59-03:00`).toISOString() : null,
            active: true,
          },
          true,
        ),
      { success: "Cupom criado", onSuccess: () => setF(blank) },
    );
  };

  const status = (c: CouponRow) => {
    const now = nowMs();
    if (!c.active) return <Badge className="bg-mist text-navy-soft ring-line">Pausado</Badge>;
    if (c.ends_at && new Date(c.ends_at).getTime() < now) return <Badge className="bg-mist text-navy-soft ring-line">Expirado</Badge>;
    if (c.max_uses && c.used_count >= c.max_uses) return <Badge className="bg-mist text-navy-soft ring-line">Esgotado</Badge>;
    if (c.starts_at && new Date(c.starts_at).getTime() > now) return <Badge className="bg-amber-50 text-amber-800 ring-amber-200">Agendado</Badge>;
    return <Badge className="bg-emerald-50 text-emerald-800 ring-emerald-200">Ativo</Badge>;
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <section className="adm-card h-fit">
        <h2 className="adm-h2 mb-4">Novo cupom</h2>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label htmlFor="c-code" className="adm-label">Código</label>
            <input id="c-code" required value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, "") })} placeholder="EX.: NATAL20" className="adm-input uppercase" />
          </div>
          <div>
            <label htmlFor="c-desc" className="adm-label">Descrição interna</label>
            <input id="c-desc" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="adm-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="c-pct" className="adm-label">Desconto (%)</label>
              <input id="c-pct" type="number" min={1} max={90} required value={f.percent} onChange={(e) => setF({ ...f, percent: e.target.value })} className="adm-input" />
            </div>
            <div>
              <label htmlFor="c-max" className="adm-label">Limite de usos</label>
              <input id="c-max" type="number" min={1} value={f.max_uses} onChange={(e) => setF({ ...f, max_uses: e.target.value })} placeholder="Sem limite" className="adm-input" />
            </div>
          </div>
          <div>
            <label htmlFor="c-min" className="adm-label">Compra mínima (R$)</label>
            <input id="c-min" inputMode="decimal" value={f.min_subtotal} onChange={(e) => setF({ ...f, min_subtotal: e.target.value })} placeholder="0,00" className="adm-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="c-start" className="adm-label">Início</label>
              <input id="c-start" type="date" value={f.starts_at} onChange={(e) => setF({ ...f, starts_at: e.target.value })} className="adm-input" />
            </div>
            <div>
              <label htmlFor="c-end" className="adm-label">Fim</label>
              <input id="c-end" type="date" value={f.ends_at} onChange={(e) => setF({ ...f, ends_at: e.target.value })} className="adm-input" />
            </div>
          </div>
          <button type="submit" disabled={pending} className="btn btn-primary btn-sm w-full">{pending ? "Salvando…" : "Criar cupom"}</button>
        </form>
      </section>

      <section className="adm-card overflow-x-auto p-0 sm:p-0">
        <table className="adm-table min-w-[620px]">
          <thead>
            <tr>
              <th className="pl-5">Cupom</th>
              <th>Desconto</th>
              <th>Regras</th>
              <th>Usos</th>
              <th>Status</th>
              <th className="pr-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code}>
                <td className="pl-5">
                  <span className="font-mono font-semibold">{c.code}</span>
                  {c.description && <span className="block text-[11px] text-navy-soft">{c.description}</span>}
                </td>
                <td className="font-semibold">{c.percent}%</td>
                <td className="text-[12px] text-navy-soft">
                  {Number(c.min_subtotal) > 0 && <span className="block">Mín. {formatPrice(Number(c.min_subtotal))}</span>}
                  {c.ends_at && <span className="block">Até {fmtDate(c.ends_at)}</span>}
                  {!Number(c.min_subtotal) && !c.ends_at && "—"}
                </td>
                <td className="tabular-nums">{c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                <td>{status(c)}</td>
                <td className="pr-5">
                  <div className="flex justify-end gap-1">
                    <button type="button" disabled={pending} onClick={() => run(() => toggleCoupon(c.code, !c.active))} className="btn btn-outline btn-sm px-3">
                      {c.active ? "Pausar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => confirm(`Excluir o cupom ${c.code}?`) && run(() => deleteCoupon(c.code), { success: "Cupom excluído" })}
                      aria-label={`Excluir ${c.code}`}
                      className="grid size-9 place-items-center rounded-full text-navy/40 hover:bg-blush hover:text-rose-deep"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!coupons.length && <p className="p-6 text-sm text-navy-soft">Nenhum cupom cadastrado.</p>}
      </section>
    </div>
  );
}
