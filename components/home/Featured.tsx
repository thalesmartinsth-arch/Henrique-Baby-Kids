"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeatured } from "@/lib/catalog";
import { cn } from "@/lib/format";

const TABS = [
  { id: "todos", label: "Todos" },
  { id: "meninas", label: "Meninas" },
  { id: "meninos", label: "Meninos" },
  { id: "bebes", label: "Bebês" },
] as const;

export function Featured() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("todos");
  const all = getFeatured();
  const products = (tab === "todos" ? all : all.filter((p) => p.categories.includes(tab))).slice(0, 8);

  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="Coleção em destaque"
          title={
            <>
              Escolhas especiais para <em className="text-rose-deep">pequenos estilos</em>
            </>
          }
          link={{ href: "/loja", label: "Ver todos" }}
        />

        <div role="tablist" aria-label="Filtrar destaques" className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "relative min-h-11 shrink-0 rounded-[3px] px-5 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors",
                tab === t.id ? "text-white" : "text-navy/60 hover:text-navy",
              )}
            >
              {tab === t.id && (
                <motion.span layoutId="featured-tab" className="absolute inset-0 -z-0 rounded-[3px] bg-navy" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4 lg:gap-y-14">
          <AnimatePresence mode="popLayout">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
