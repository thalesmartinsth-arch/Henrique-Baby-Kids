import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/shop/PageHero";
import { ProductListing } from "@/components/shop/ProductListing";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Loja",
  description: "Todas as peças da Henrique Baby & Kids: vestidos, conjuntos, bebês e acessórios.",
};

export default function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="Loja"
        title="Todas as peças"
        description="Vestidos, conjuntos, peças para bebês e acessórios — filtre por tamanho, categoria e faixa de preço."
        crumbs={[{ label: "Início", href: "/" }, { label: "Loja" }]}
      />
      <Suspense>
        <ProductListing products={getProducts()} />
      </Suspense>
    </>
  );
}
