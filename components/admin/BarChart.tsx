import { daysAgo, formatPrice } from "@/lib/format";

type Point = { label: string; value: number };

/** Gráfico de barras simples (SVG-free, só CSS) para faturamento diário. */
export function BarChart({ data, height = 180 }: { data: Point[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <figure>
      <div className="flex items-end gap-[3px]" style={{ height }} role="img" aria-label={`Faturamento no período: ${formatPrice(total)}`}>
        {data.map((d) => (
          <div key={d.label} className="group relative flex h-full flex-1 flex-col justify-end">
            <div
              className="min-h-[2px] rounded-t-[2px] bg-sky transition-colors group-hover:bg-navy"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-navy px-2 py-1 text-[11px] text-white group-hover:block">
              {d.label}: {formatPrice(d.value)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-navy-soft">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </figure>
  );
}

/** Agrupa valores por dia (fuso de São Paulo) nos últimos `days` dias. */
export function dailySeries(rows: { created_at: string; total: number }[], days: number) {
  const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
  const keyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" });
  const buckets = new Map<string, Point>();
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    buckets.set(keyFmt.format(d), { label: fmt.format(d), value: 0 });
  }
  for (const r of rows) {
    const b = buckets.get(keyFmt.format(new Date(r.created_at)));
    if (b) b.value += Number(r.total);
  }
  return [...buckets.values()];
}
