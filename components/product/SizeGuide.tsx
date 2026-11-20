"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { SIZE_CHART } from "@/lib/site";

export function SizeChartTable({ group }: { group: "baby" | "kids" }) {
  const rows = SIZE_CHART[group];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-navy/15 text-[11px] uppercase tracking-[0.16em] text-navy-soft">
            <th className="py-3 pr-4 font-semibold">Tamanho</th>
            <th className="py-3 pr-4 font-semibold">Idade</th>
            <th className="py-3 pr-4 font-semibold">Altura (cm)</th>
            <th className="py-3 font-semibold">Tórax (cm)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.size} className="border-b border-line last:border-0">
              <td className="py-3 pr-4 font-semibold">{r.size}</td>
              <td className="py-3 pr-4">{r.age}</td>
              <td className="py-3 pr-4 tabular-nums">{r.height}</td>
              <td className="py-3 tabular-nums">{r.chest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeGuide({ baby }: { baby: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 items-center gap-2 text-[12px] font-semibold text-navy">
        <Ruler className="size-4" strokeWidth={1.5} />
        <span className="link-underline">Guia de medidas</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} side="center" label="Guia de medidas" title="Guia de medidas">
        <div className="space-y-6 p-6">
          <p className="text-sm leading-relaxed text-navy-soft">
            Medidas do corpo da criança, em centímetros. Entre dois tamanhos, prefira o maior — nossas modelagens têm folga para o crescimento.
          </p>
          <SizeChartTable group={baby ? "baby" : "kids"} />
          <div className="rounded-[3px] bg-sky-soft/70 p-4 text-[13px] leading-relaxed">
            <strong>Como medir:</strong> altura com a criança descalça, encostada na parede; tórax na parte mais larga do peito, com a fita sem apertar.
          </div>
        </div>
      </Sheet>
    </>
  );
}
