"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { PageHero } from "@/components/shop/PageHero";
import { getProductById } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { useShop } from "@/store/shop";
import { useHydrated } from "@/store/ui";

export default function FavoritesPage() {
  const hydrated = useHydrated();
  const ids = useShop((s) => s.favorites);
  const products = hydrated ? ids.map(getProductById).filter((p): p is Product => Boolean(p)) : [];

  return (
    <>
      <PageHero
        eyebrow="Sua seleção"
        title="Favoritos"
        description={products.length ? `${products.length} ${products.length === 1 ? "peça salva" : "peças salvas"} neste navegador.` : undefined}
        crumbs={[{ label: "Início", href: "/" }, { label: "Favoritos" }]}
      />
      <div className="wrap pb-24">
        {!hydrated ? (
          <div className="h-96" />
        ) : products.length ? (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center rounded-[var(--radius-card)] bg-white px-6 py-20 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-blush">
              <Heart className="size-8 text-rose-deep" strokeWidth={1.3} />
            </span>
            <p className="mt-6 font-serif text-3xl">Nenhum favorito ainda</p>
            <p className="mt-2 max-w-sm text-sm text-navy-soft">Toque no coração das peças que você gostar para guardá-las aqui.</p>
            <Link href="/loja" className="btn btn-primary mt-8">
              Explorar a loja
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
