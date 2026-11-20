"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { Price } from "@/components/ui/Price";
import { SizePicker } from "@/components/ui/SizePicker";
import { cn, discountPercent } from "@/lib/format";
import { useAddToCart } from "@/lib/hooks";
import type { Product } from "@/lib/types";
import { useUI } from "@/store/ui";

type Props = { product: Product; priority?: boolean; sizes?: string; className?: string };

export function ProductCard({ product, priority, sizes = "(min-width: 1024px) 25vw, 50vw", className }: Props) {
  const [size, setSize] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const addToCart = useAddToCart();
  const notify = useUI((s) => s.notify);
  const off = discountPercent(product.price, product.compareAtPrice);
  const available = product.sizes.filter((s) => !product.soldOut?.includes(s));
  const href = `/produto/${product.slug}`;

  const quickBuy = () => {
    if (!size) {
      setPicking(true);
      setInvalid(true);
      setTimeout(() => setInvalid(false), 450);
      notify({ title: "Escolha um tamanho", description: product.name, tone: "error" });
      return;
    }
    addToCart(product.id, size);
    setPicking(false);
  };

  return (
    <article className={cn("group/card relative flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-mist">
        <Link href={href} aria-label={product.name} className="block">
          <div className="relative aspect-[3/4]">
            <Image
              src={product.images[0].src}
              alt={product.images[0].alt}
              fill
              priority={priority}
              sizes={sizes}
              className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-soft)] group-hover/card:scale-[1.03]"
            />
            {product.images[1] && (
              <Image
                src={product.images[1].src}
                alt=""
                fill
                sizes={sizes}
                className="object-cover opacity-0 transition-opacity duration-700 ease-[var(--ease-soft)] group-hover/card:opacity-100 max-lg:hidden"
              />
            )}
          </div>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="rounded-[3px] bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy">
              Novo
            </span>
          )}
          {off > 0 && (
            <span className="rounded-[3px] bg-rose px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-navy">
              -{off}%
            </span>
          )}
        </div>
        <FavoriteButton productId={product.id} className="absolute right-3 top-3" />

        {/* Compra rápida — desliza no hover (desktop) ou abre ao tocar (mobile) */}
        <div
          className={cn(
            "absolute inset-x-2 bottom-2 rounded-[4px] bg-white/95 p-3 shadow-[0_12px_30px_-18px_rgba(38,59,85,0.6)] backdrop-blur transition-all duration-500 ease-[var(--ease-soft)]",
            picking
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0 lg:group-hover/card:pointer-events-auto lg:group-hover/card:translate-y-0 lg:group-hover/card:opacity-100 lg:group-focus-within/card:pointer-events-auto lg:group-focus-within/card:translate-y-0 lg:group-focus-within/card:opacity-100",
          )}
        >
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy-soft">Selecione o tamanho</p>
          <SizePicker compact sizes={product.sizes} soldOut={product.soldOut} value={size} onChange={setSize} invalid={invalid} />
          <button type="button" onClick={quickBuy} className="btn btn-primary mt-3 min-h-10 w-full text-[11px]">
            <ShoppingBag className="size-3.5" />
            {size ? `Adicionar tam. ${size}` : "Compra rápida"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2 px-0.5">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="text-[14px] font-semibold leading-snug text-navy sm:text-[15px]">
            <span className="link-underline">{product.name}</span>
          </Link>
        </div>
        <p className="line-clamp-1 text-[12px] text-navy-soft">{product.color}</p>
        <Price price={product.price} compareAt={product.compareAtPrice} />
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-[11px] tracking-wide text-navy/50">
            {available.length} tamanho{available.length > 1 ? "s" : ""} · {product.sizes[0]}–{product.sizes[product.sizes.length - 1]}
          </p>
          <button
            type="button"
            onClick={() => setPicking((v) => !v)}
            aria-expanded={picking}
            className="grid size-10 place-items-center rounded-full border border-line text-navy transition-colors hover:border-navy lg:hidden"
            aria-label={`Compra rápida: ${product.name}`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={String(picking)} initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} className="inline-flex">
                <ShoppingBag className="size-4" strokeWidth={1.6} />
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </article>
  );
}
