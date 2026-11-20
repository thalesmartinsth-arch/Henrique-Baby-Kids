"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { CartLineItem, CouponField, FreeShippingBar, ShippingField, TotalsRows, useCart } from "./CartParts";
import { useHydrated, useUI } from "@/store/ui";

export function MiniCart() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const hydrated = useHydrated();
  const router = useRouter();
  const { lines, totals } = useCart();
  const close = () => setOpen(false);
  const empty = !hydrated || lines.length === 0;

  return (
    <Sheet
      open={open}
      onClose={close}
      label="Sacola de compras"
      title={
        <span>
          Sua sacola <span className="font-sans text-sm text-navy-soft">({hydrated ? totals.count : 0})</span>
        </span>
      }
      footer={
        !empty && (
          <div className="space-y-4 p-5 sm:p-6">
            <TotalsRows compact />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={close} className="btn btn-outline px-3">
                Continuar comprando
              </button>
              <button
                type="button"
                onClick={() => {
                  close();
                  router.push("/checkout");
                }}
                className="btn btn-primary px-3"
              >
                Finalizar pedido
              </button>
            </div>
            <Link href="/sacola" onClick={close} className="link-underline mx-auto block w-fit text-[12px] text-navy-soft">
              Ver sacola completa
            </Link>
          </div>
        )
      }
    >
      {empty ? (
        <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-blush">
            <ShoppingBag className="size-8 text-rose-deep" strokeWidth={1.3} />
          </span>
          <p className="mt-6 font-serif text-3xl">Sua sacola está vazia</p>
          <p className="mt-2 max-w-xs text-sm text-navy-soft">Que tal começar pelos lançamentos da semana?</p>
          <Link href="/loja/novidades" onClick={close} className="btn btn-primary mt-8">
            Ver novidades
          </Link>
        </div>
      ) : (
        <div className="space-y-5 px-5 py-5 sm:px-6">
          <FreeShippingBar remaining={totals.remainingForFreeShipping} />
          <ul>
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <CartLineItem key={`${line.productId}-${line.size}`} line={line} onNavigate={close} />
              ))}
            </AnimatePresence>
          </ul>
          <div className="space-y-5 rounded-[3px] bg-white p-4">
            <CouponField />
            <ShippingField />
          </div>
        </div>
      )}
    </Sheet>
  );
}
