"use client";

import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { CartLineItem, CouponField, FreeShippingBar, ShippingField, TotalsRows, useCart } from "@/components/cart/CartParts";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { PageHero } from "@/components/shop/PageHero";
import { getNewArrivals } from "@/lib/catalog";
import { useHydrated } from "@/store/ui";

export default function BagPage() {
  const hydrated = useHydrated();
  const { lines, totals } = useCart();
  const empty = !hydrated || lines.length === 0;
  const suggestions = getNewArrivals().filter((p) => !lines.some((l) => l.productId === p.id));

  return (
    <>
      <PageHero title="Sacola" crumbs={[{ label: "Início", href: "/" }, { label: "Sacola" }]} />
      <div className="wrap pb-20">
        {empty ? (
          <div className="flex flex-col items-center rounded-[var(--radius-card)] bg-white px-6 py-20 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-blush">
              <ShoppingBag className="size-8 text-rose-deep" strokeWidth={1.3} />
            </span>
            <p className="mt-6 font-serif text-3xl">Sua sacola está vazia</p>
            <Link href="/loja" className="btn btn-primary mt-8">
              Começar a comprar
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16">
            <div>
              <FreeShippingBar remaining={totals.remainingForFreeShipping} />
              <ul className="mt-4">
                <AnimatePresence initial={false}>
                  {lines.map((line) => (
                    <CartLineItem key={`${line.productId}-${line.size}`} line={line} />
                  ))}
                </AnimatePresence>
              </ul>
            </div>
            <aside className="h-fit space-y-6 rounded-[var(--radius-card)] bg-white p-6 lg:sticky lg:top-[180px] lg:p-8" aria-label="Resumo do pedido">
              <h2 className="font-serif text-3xl">Resumo</h2>
              <CouponField />
              <ShippingField />
              <TotalsRows />
              <Link href="/checkout" className="btn btn-primary w-full">
                Finalizar pedido
              </Link>
              <Link href="/loja" className="btn btn-outline w-full">
                Continuar comprando
              </Link>
            </aside>
          </div>
        )}
      </div>
      {suggestions.length > 0 && (
        <section className="overflow-hidden border-t border-line bg-white py-20">
          <div className="wrap">
            <h2 className="display mb-10 text-4xl sm:text-5xl">
              Você também pode <em className="text-sky-deep">gostar</em>
            </h2>
            <ProductCarousel products={suggestions} label="Sugestões" />
          </div>
        </section>
      )}
    </>
  );
}
