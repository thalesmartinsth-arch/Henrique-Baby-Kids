import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Aguardando pagamento", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  paid: { label: "Pago", className: "bg-sky-soft text-sky-deep ring-sky/40" },
  shipped: { label: "Enviado", className: "bg-indigo-50 text-navy ring-navy/15" },
  delivered: { label: "Entregue", className: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  cancelled: { label: "Cancelado", className: "bg-mist text-navy-soft ring-line" },
};

export const PRODUCT_STATUS: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  draft: { label: "Rascunho", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  archived: { label: "Arquivado", className: "bg-mist text-navy-soft ring-line" },
};

export const PAYMENT_LABEL: Record<string, string> = { pix: "Pix", cartao: "Cartão", boleto: "Boleto" };

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset", className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, map = ORDER_STATUS }: { status: string; map?: Record<string, { label: string; className: string }> }) {
  const s = map[status] ?? { label: status, className: "bg-mist text-navy ring-line" };
  return <Badge className={s.className}>{s.label}</Badge>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="adm-title">{title}</h1>
        {description && <p className="mt-1 text-sm text-navy-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "rose" | "sky" | "default" }) {
  return (
    <div className="adm-card">
      <p className="adm-h2">{label}</p>
      <p
        className={cn(
          "mt-3 text-[26px] font-semibold tabular-nums tracking-tight",
          tone === "rose" && "text-rose-deep",
          tone === "sky" && "text-sky-deep",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[12px] text-navy-soft">{hint}</p>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line bg-white px-6 py-14 text-center">
      <p className="font-serif text-2xl">{title}</p>
      {children && <div className="mt-2 text-sm text-navy-soft">{children}</div>}
    </div>
  );
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });
const dateTimeFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});
export const fmtDate = (iso: string) => dateFmt.format(new Date(iso.length === 10 ? `${iso}T12:00:00` : iso));
export const fmtDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
