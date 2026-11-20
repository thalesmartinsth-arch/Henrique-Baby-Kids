"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Collection, Product } from "@/lib/types";

type CatalogValue = {
  products: Product[];
  collections: Collection[];
  byId: (id: string) => Product | undefined;
};

const CatalogContext = createContext<CatalogValue | null>(null);

/** Disponibiliza o catálogo (vindo do servidor) para sacola, busca e favoritos. */
export function CatalogProvider({ products, collections, children }: { products: Product[]; collections: Collection[]; children: ReactNode }) {
  const value = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return { products, collections, byId: (id: string) => map.get(id) };
  }, [products, collections]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog precisa estar dentro de <CatalogProvider>");
  return ctx;
}
