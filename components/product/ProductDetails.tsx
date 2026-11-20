"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, RefreshCw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { Price } from "@/components/ui/Price";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { SizePicker } from "@/components/ui/SizePicker";
import { SizeGuide } from "./SizeGuide";
import { FREE_SHIPPING_THRESHOLD, BABY_SIZES, getCollection } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/format";
import { useAddToCart } from "@/lib/hooks";
import { formatCep, quoteShipping } from "@/lib/pricing";
import type { Product } from "@/lib/types";

function Accordion({ title, icon, children, defaultOpen }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-line">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex min-h-14 w-full items-center gap-3 text-left text-[13px] font-semibold uppercase tracking-[0.14em]">
        <span className="text-sky-deep">{icon}</span>
        <span className="flex-1">{title}</span>
        <ChevronDown className={cn("size-4 transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="pb-5 text-[14px] leading-relaxed text-navy-soft">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShippingEstimator({ price }: { price: number }) {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<ReturnType<typeof quoteShipping>>(null);
  const [error, setError] = useState("");
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const q = quoteShipping(cep, price);
        setError(q ? "" : "Informe um CEP com 8 dígitos.");
        setResult(q);
      }}
      className="mt-4"
    >
      <label htmlFor="pdp-cep" className="sr-only">CEP</label>
      <div className="flex gap-2">
        <input id="pdp-cep" inputMode="numeric" value={cep} onChange={(e) => setCep(formatCep(e.target.value))} placeholder="Seu CEP" className="field h-11" />
        <button type="submit" className="btn btn-outline h-11 min-h-11 px-5">Calcular</button>
      </div>
      {error && <p className="mt-2 text-[12px] text-rose-deep">{error}</p>}
      {result && (
        <p className="mt-2 text-[13px]">
          {result.label} · {result.days} · <strong>{result.price ? formatPrice(result.price) : "Grátis"}</strong>
        </p>
      )}
    </form>
  );
}

export function ProductDetails({ product }: { product: Product }) {
  const router = useRouter();
  const addToCart = useAddToCart();
  const available = product.sizes.filter((s) => !product.soldOut?.includes(s));
  const [size, setSize] = useState<string | null>(available.length === 1 ? available[0] : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const collection = getCollection(product.collection);
  const isBaby = product.sizes.every((s) => BABY_SIZES.includes(s));

  const guard = () => {
    if (size) return true;
    setError(true);
    document.getElementById("size-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  };

  return (
    <div className="lg:sticky lg:top-[180px]">
      <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em]">
        {product.isNew && <span className="rounded-[3px] bg-sky-soft px-2 py-1 text-sky-deep">Novo</span>}
        {collection && <span className="text-navy-soft">{collection.name}</span>}
      </div>
      <h1 className="display mt-4 text-[44px] sm:text-[56px]">{product.name}</h1>
      <p className="mt-3 text-[15px] text-navy-soft">{product.shortDescription}</p>

      <Price price={product.price} compareAt={product.compareAtPrice} size="lg" className="mt-6" />
      <p className="mt-2 text-[13px] text-sky-deep">
        5% de desconto no Pix: <strong>{formatPrice(product.price * 0.95)}</strong>
      </p>

      <div className="mt-8 border-t border-line pt-7" id="size-picker">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em]">
            Tamanho {size && <span className="font-normal normal-case tracking-normal text-navy-soft">· {size}</span>}
          </p>
          <SizeGuide baby={isBaby} />
        </div>
        <SizePicker
          sizes={product.sizes}
          soldOut={product.soldOut}
          value={size}
          onChange={(s) => {
            setSize(s);
            setError(false);
          }}
          invalid={error}
        />
        {error && <p className="mt-3 text-[13px] text-rose-deep" role="alert">Escolha um tamanho para continuar.</p>}
        {!!product.soldOut?.length && <p className="mt-3 text-[12px] text-navy-soft">Tamanho riscado: esgotado no momento.</p>}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} />
        <span className="text-[12px] text-navy-soft">Cor: {product.color}</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={() => {
            if (!guard()) return;
            addToCart(product.id, size!, qty, { openCart: true });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
          className="btn btn-primary h-14 w-full"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(added)} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="inline-flex items-center gap-2">
              {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
              {added ? "Adicionado" : "Adicionar à sacola"}
            </motion.span>
          </AnimatePresence>
        </button>
        <FavoriteButton productId={product.id} withLabel className="h-14" />
      </div>
      <button
        type="button"
        onClick={() => {
          if (!guard()) return;
          addToCart(product.id, size!, qty);
          router.push("/checkout");
        }}
        className="btn btn-rose mt-3 h-14 w-full"
      >
        Comprar agora
      </button>

      <ul className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] leading-snug text-navy-soft">
        <li className="rounded-[3px] bg-white p-3"><Truck className="mx-auto mb-2 size-5 text-sky-deep" strokeWidth={1.4} />Frete grátis acima de {formatPrice(FREE_SHIPPING_THRESHOLD)}</li>
        <li className="rounded-[3px] bg-white p-3"><RefreshCw className="mx-auto mb-2 size-5 text-sky-deep" strokeWidth={1.4} />Primeira troca grátis</li>
        <li className="rounded-[3px] bg-white p-3"><ShieldCheck className="mx-auto mb-2 size-5 text-sky-deep" strokeWidth={1.4} />Compra 100% segura</li>
      </ul>

      <div className="mt-8 border-t border-line">
        <Accordion title="Descrição" icon={<span className="block size-1.5 rounded-full bg-rose-deep" />} defaultOpen>
          <p>{product.description}</p>
          <ul className="mt-4 space-y-1.5">
            {product.details.map((d) => (
              <li key={d} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-navy/40" />{d}</li>
            ))}
          </ul>
        </Accordion>
        <Accordion title="Entrega" icon={<Truck className="size-4" />}>
          <p>Enviamos para todo o Brasil em até 2 dias úteis após a confirmação do pagamento. Frete grátis em compras acima de {formatPrice(FREE_SHIPPING_THRESHOLD)}.</p>
          <ShippingEstimator price={product.price * qty} />
        </Accordion>
        <Accordion title="Trocas e devoluções" icon={<RefreshCw className="size-4" />}>
          <p>Até 30 dias para trocar, com a primeira troca grátis. Devolução por arrependimento em até 7 dias após o recebimento. A peça deve estar sem uso e com etiqueta.</p>
        </Accordion>
      </div>
    </div>
  );
}
