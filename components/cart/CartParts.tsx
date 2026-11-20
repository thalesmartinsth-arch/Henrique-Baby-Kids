"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Trash2, Truck, X } from "lucide-react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/catalog";
import { cn, formatPrice, installments } from "@/lib/format";
import { cartTotals, formatCep, quoteShipping, resolveCart, type CartLine } from "@/lib/pricing";
import { useShop } from "@/store/shop";

export function useCart() {
  const items = useShop((s) => s.cart);
  const coupon = useShop((s) => s.coupon);
  const cep = useShop((s) => s.cep);
  const lines = resolveCart(items);
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const shipping = quoteShipping(cep, subtotal);
  const totals = cartTotals(lines, coupon, shipping);
  return { lines, shipping, totals, cep };
}

export function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const setQuantity = useShop((s) => s.setQuantity);
  const remove = useShop((s) => s.removeFromCart);
  const { product } = line;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24, height: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-4 border-b border-line py-5 last:border-0"
    >
      <Link
        href={`/produto/${product.slug}`}
        onClick={onNavigate}
        className="group relative h-[120px] w-[92px] shrink-0 overflow-hidden rounded-[3px] bg-mist"
      >
        <Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="92px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/produto/${product.slug}`} onClick={onNavigate} className="link-underline text-[14px] font-semibold leading-snug">
              {product.name}
            </Link>
            <p className="mt-1 text-[12px] text-navy-soft">
              Tam. {line.size} · {product.color}
            </p>
            <p className="mt-1 text-[12px] text-navy-soft">{formatPrice(product.price)} cada</p>
          </div>
          <button
            type="button"
            aria-label={`Remover ${product.name}`}
            onClick={() => remove(line.productId, line.size)}
            className="grid size-9 shrink-0 place-items-center rounded-full text-navy/50 transition-colors hover:bg-blush hover:text-rose-deep"
          >
            <Trash2 className="size-4" strokeWidth={1.6} />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <QuantityStepper
            size="sm"
            value={line.quantity}
            min={0}
            onChange={(q) => setQuantity(line.productId, line.size, q)}
          />
          <motion.span key={line.lineTotal} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[15px] font-semibold tabular-nums">
            {formatPrice(line.lineTotal)}
          </motion.span>
        </div>
      </div>
    </motion.li>
  );
}

export function FreeShippingBar({ remaining }: { remaining: number }) {
  const pct = Math.min(100, ((FREE_SHIPPING_THRESHOLD - remaining) / FREE_SHIPPING_THRESHOLD) * 100);
  return (
    <div className="rounded-[3px] bg-sky-soft/70 p-4">
      <p className="flex items-center gap-2 text-[13px] text-navy">
        <Truck className="size-4 shrink-0 text-sky-deep" strokeWidth={1.6} />
        {remaining > 0 ? (
          <span>
            Faltam <strong>{formatPrice(remaining)}</strong> para o frete grátis
          </span>
        ) : (
          <span>
            <strong>Frete grátis</strong> garantido neste pedido
          </span>
        )}
      </p>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-white">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sky to-rose"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export function CouponField() {
  const coupon = useShop((s) => s.coupon);
  const apply = useShop((s) => s.applyCoupon);
  const removeCoupon = useShop((s) => s.removeCoupon);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  if (coupon) {
    return (
      <div className="flex items-center justify-between rounded-[3px] border border-dashed border-rose bg-blush/60 px-4 py-3 text-[13px]">
        <span className="flex items-center gap-2 font-semibold">
          <Tag className="size-4 text-rose-deep" /> {coupon} aplicado
        </span>
        <button type="button" onClick={removeCoupon} aria-label="Remover cupom" className="grid size-8 place-items-center rounded-full hover:bg-white">
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim()) return setError("Digite um cupom.");
        if (apply(code)) {
          setError("");
          setCode("");
        } else setError("Cupom inválido. Experimente BEMVINDO10.");
      }}
      noValidate
    >
      <label htmlFor="coupon" className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em]">
        Cupom de desconto
      </label>
      <div className="flex gap-2">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ex.: BEMVINDO10"
          aria-invalid={!!error}
          aria-describedby={error ? "coupon-error" : undefined}
          className={cn("field h-11 uppercase", error && "border-rose-deep")}
        />
        <button type="submit" className="btn btn-outline h-11 min-h-11 px-5">
          Aplicar
        </button>
      </div>
      {error && (
        <p id="coupon-error" className="mt-2 text-[12px] text-rose-deep">
          {error}
        </p>
      )}
    </form>
  );
}

export function ShippingField() {
  const cep = useShop((s) => s.cep);
  const setCep = useShop((s) => s.setCep);
  const { shipping } = useCart();
  const [value, setValue] = useState(cep);
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.replace(/\D/g, "").length !== 8) return setError("Informe um CEP com 8 dígitos.");
        setError("");
        setCep(value);
      }}
      noValidate
    >
      <label htmlFor="cep" className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.14em]">
        Calcular frete
      </label>
      <div className="flex gap-2">
        <input
          id="cep"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(formatCep(e.target.value))}
          placeholder="00000-000"
          aria-invalid={!!error}
          className={cn("field h-11", error && "border-rose-deep")}
        />
        <button type="submit" className="btn btn-outline h-11 min-h-11 px-5">
          Calcular
        </button>
      </div>
      {error && <p className="mt-2 text-[12px] text-rose-deep">{error}</p>}
      {shipping && !error && (
        <p className="mt-2 text-[12px] text-navy-soft">
          {shipping.label} · {shipping.days} · <strong className="text-navy">{shipping.price ? formatPrice(shipping.price) : "Grátis"}</strong>
        </p>
      )}
    </form>
  );
}

export function TotalsRows({ compact }: { compact?: boolean }) {
  const { totals, shipping } = useCart();
  return (
    <dl className={cn("space-y-2 text-[14px]", compact && "text-[13px]")}>
      <div className="flex justify-between">
        <dt className="text-navy-soft">Subtotal</dt>
        <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 && (
        <div className="flex justify-between text-rose-deep">
          <dt>Desconto ({totals.coupon?.code})</dt>
          <dd className="tabular-nums">-{formatPrice(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-navy-soft">Frete</dt>
        <dd className="tabular-nums">
          {shipping ? (totals.shippingPrice ? formatPrice(totals.shippingPrice) : "Grátis") : totals.remainingForFreeShipping === 0 ? "Grátis" : "Calcule acima"}
        </dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <dt className="font-semibold">Total</dt>
        <dd className="text-right">
          <motion.span key={totals.total} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="block text-xl font-semibold tabular-nums">
            {formatPrice(totals.total)}
          </motion.span>
          {totals.total > 0 && <span className="text-[12px] text-navy-soft">ou {installments(totals.total).label}</span>}
        </dd>
      </div>
    </dl>
  );
}
