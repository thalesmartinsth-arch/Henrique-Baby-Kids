"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Lock, QrCode, Receipt } from "lucide-react";
import { CouponField, TotalsRows, useCart } from "@/components/cart/CartParts";
import { Breadcrumbs } from "@/components/shop/PageHero";
import { cn, formatPrice, installments } from "@/lib/format";
import { formatCep } from "@/lib/pricing";
import { useShop } from "@/store/shop";
import { useHydrated } from "@/store/ui";

type Form = {
  name: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  payment: "pix" | "cartao" | "boleto";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().split(/\s+/).length < 2) e.name = "Informe nome e sobrenome.";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "E-mail inválido.";
  if (f.phone.replace(/\D/g, "").length < 10) e.phone = "Telefone com DDD.";
  if (f.cep.replace(/\D/g, "").length !== 8) e.cep = "CEP com 8 dígitos.";
  if (!f.street.trim()) e.street = "Informe a rua.";
  if (!f.number.trim()) e.number = "Informe o número.";
  if (!f.district.trim()) e.district = "Informe o bairro.";
  if (!f.city.trim()) e.city = "Informe a cidade.";
  if (!/^[A-Za-z]{2}$/.test(f.state.trim())) e.state = "UF com 2 letras.";
  return e;
}

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
};

function Field({
  id,
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-semibold text-navy">
        {label}
      </label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} className={cn("field", error && "border-rose-deep")} {...props} />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[12px] text-rose-deep">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const hydrated = useHydrated();
  // Carrinho e CEP vêm do localStorage: o formulário só monta no cliente,
  // assim o estado inicial já recebe os dados salvos.
  if (!hydrated) return <div className="min-h-[70vh]" aria-busy="true" />;
  return <CheckoutContent />;
}

function CheckoutContent() {
  const { lines, totals } = useCart();
  const savedCep = useShop((s) => s.cep);
  const setCep = useShop((s) => s.setCep);
  const clearCart = useShop((s) => s.clearCart);
  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    phone: "",
    cep: savedCep,
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    payment: "pix",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [order, setOrder] = useState<{ id: string; total: number } | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const pixTotal = totals.total * 0.95;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    setCep(form.cep);
    // Integração futura: criar o pedido no backend e redirecionar ao gateway de pagamento.
    await new Promise((r) => setTimeout(r, 1200));
    setOrder({ id: `HBK-${Math.floor(100000 + Math.random() * 900000)}`, total: form.payment === "pix" ? pixTotal : totals.total });
    clearCart();
    setStatus("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (status === "done" && order) {
    return (
      <div className="wrap flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="grid size-20 place-items-center rounded-full bg-sky-soft text-sky-deep">
          <Check className="size-9" />
        </motion.span>
        <p className="eyebrow mt-8">Pedido {order.id}</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">Obrigado, {form.name.split(" ")[0]}!</h1>
        <p className="mt-4 max-w-md text-navy-soft">
          Recebemos seu pedido de <strong className="text-navy">{formatPrice(order.total)}</strong>. Esta é uma loja de demonstração: nenhum pagamento foi cobrado.
        </p>
        <Link href="/" className="btn btn-primary mt-10">
          Voltar para a loja
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="wrap flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="display text-5xl">Sua sacola está vazia</h1>
        <Link href="/loja" className="btn btn-primary mt-8">
          Explorar a loja
        </Link>
      </div>
    );
  }

  const payments = [
    { id: "pix", icon: QrCode, title: "Pix", text: `5% de desconto · ${formatPrice(pixTotal)}` },
    { id: "cartao", icon: CreditCard, title: "Cartão de crédito", text: totals.total ? installments(totals.total).label : "" },
    { id: "boleto", icon: Receipt, title: "Boleto", text: "Vencimento em 2 dias úteis" },
  ] as const;

  return (
    <div className="wrap pb-24 pt-6 lg:pt-8">
      <Breadcrumbs items={[{ label: "Sacola", href: "/sacola" }, { label: "Finalizar pedido" }]} />
      <h1 className="display mt-6 text-5xl sm:text-6xl">Finalizar pedido</h1>

      <form onSubmit={submit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
        <div className="space-y-12">
          <fieldset>
            <legend className="mb-6 flex items-center gap-3 font-serif text-3xl">
              <span className="grid size-8 place-items-center rounded-full bg-navy font-sans text-sm text-white">1</span>
              Seus dados
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="co-name" label="Nome completo" autoComplete="name" value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} className="sm:col-span-2" />
              <Field id="co-email" label="E-mail" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
              <Field id="co-phone" label="Celular" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} error={errors.phone} placeholder="(00) 00000-0000" />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-6 flex items-center gap-3 font-serif text-3xl">
              <span className="grid size-8 place-items-center rounded-full bg-navy font-sans text-sm text-white">2</span>
              Entrega
            </legend>
            <div className="grid gap-4 sm:grid-cols-6">
              <Field id="co-cep" label="CEP" inputMode="numeric" autoComplete="postal-code" value={form.cep} onChange={(e) => set("cep", formatCep(e.target.value))} error={errors.cep} className="sm:col-span-2" placeholder="00000-000" />
              <Field id="co-street" label="Rua" autoComplete="address-line1" value={form.street} onChange={(e) => set("street", e.target.value)} error={errors.street} className="sm:col-span-4" />
              <Field id="co-number" label="Número" value={form.number} onChange={(e) => set("number", e.target.value)} error={errors.number} className="sm:col-span-2" />
              <Field id="co-complement" label="Complemento (opcional)" autoComplete="address-line2" value={form.complement} onChange={(e) => set("complement", e.target.value)} className="sm:col-span-4" />
              <Field id="co-district" label="Bairro" value={form.district} onChange={(e) => set("district", e.target.value)} error={errors.district} className="sm:col-span-2" />
              <Field id="co-city" label="Cidade" autoComplete="address-level2" value={form.city} onChange={(e) => set("city", e.target.value)} error={errors.city} className="sm:col-span-3" />
              <Field id="co-state" label="UF" autoComplete="address-level1" maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} error={errors.state} className="sm:col-span-1" />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-6 flex items-center gap-3 font-serif text-3xl">
              <span className="grid size-8 place-items-center rounded-full bg-navy font-sans text-sm text-white">3</span>
              Pagamento
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {payments.map(({ id, icon: Icon, title, text }) => (
                <label
                  key={id}
                  className={cn(
                    "relative flex cursor-pointer flex-col gap-3 rounded-[var(--radius-card)] border bg-white p-5 transition-all hover:-translate-y-0.5",
                    form.payment === id ? "border-navy shadow-[0_12px_30px_-20px_rgba(38,59,85,0.6)]" : "border-line hover:border-navy/40",
                  )}
                >
                  <input type="radio" name="payment" value={id} checked={form.payment === id} onChange={() => set("payment", id)} className="peer sr-only" />
                  <Icon className="size-6 text-sky-deep" strokeWidth={1.4} />
                  <span className="text-[14px] font-semibold">{title}</span>
                  <span className="text-[12px] text-navy-soft">{text}</span>
                  {form.payment === id && <Check className="absolute right-4 top-4 size-4" />}
                </label>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-2 text-[12px] text-navy-soft">
              <Lock className="size-3.5" /> Os dados de pagamento são preenchidos no ambiente seguro do meio de pagamento.
            </p>
          </fieldset>
        </div>

        <aside className="h-fit space-y-6 rounded-[var(--radius-card)] bg-white p-6 lg:sticky lg:top-[180px] lg:p-8" aria-label="Resumo do pedido">
          <h2 className="font-serif text-3xl">Resumo</h2>
          <ul className="max-h-[320px] space-y-4 overflow-y-auto pr-1">
            {lines.map((l) => (
              <li key={`${l.productId}-${l.size}`} className="flex gap-3">
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[3px] bg-mist">
                  <Image src={l.product.images[0].src} alt="" fill sizes="64px" className="object-cover" />
                  <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-navy text-[10px] font-bold text-white">{l.quantity}</span>
                </div>
                <div className="min-w-0 flex-1 text-[13px]">
                  <p className="font-semibold leading-snug">{l.product.name}</p>
                  <p className="text-navy-soft">Tam. {l.size}</p>
                </div>
                <p className="text-[13px] font-semibold tabular-nums">{formatPrice(l.lineTotal)}</p>
              </li>
            ))}
          </ul>
          <CouponField />
          <TotalsRows />
          {form.payment === "pix" && totals.total > 0 && (
            <p className="rounded-[3px] bg-sky-soft/70 px-4 py-3 text-[13px]">
              No Pix: <strong>{formatPrice(pixTotal)}</strong>
            </p>
          )}
          <button type="submit" disabled={status === "sending"} className="btn btn-primary h-14 w-full">
            {status === "sending" ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Enviando pedido" /> : "Confirmar pedido"}
          </button>
          <p className="text-center text-[11px] text-navy-soft">Loja de demonstração — nenhum valor será cobrado.</p>
        </aside>
      </form>
    </div>
  );
}
