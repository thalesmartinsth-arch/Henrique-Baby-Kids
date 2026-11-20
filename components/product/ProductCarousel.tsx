"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/format";

/** Carrossel com scroll-snap nativo: arraste/toque no mobile, setas no desktop. */
export function ProductCarousel({ products, label }: { products: Product[]; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const [progress, setProgress] = useState(0);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
    setProgress(max > 0 ? el.scrollLeft / max : 0);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-slide]");
    const step = card ? card.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step * (window.innerWidth >= 1024 ? 2 : 1), behavior: "smooth" });
  };

  return (
    <div role="region" aria-roledescription="carrossel" aria-label={label}>
      <div
        ref={track}
        onScroll={update}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:gap-5 lg:scroll-px-0 lg:px-0"
      >
        {products.map((p, i) => (
          <div
            key={p.id}
            data-slide
            className="w-[72%] shrink-0 snap-start sm:w-[44%] md:w-[36%] lg:w-[calc((100%-60px)/4)]"
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${products.length}`}
          >
            <ProductCard product={p} sizes="(min-width: 1024px) 25vw, 70vw" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center gap-6">
        <div className="relative h-px flex-1 bg-line">
          <div
            className="absolute inset-y-0 left-0 bg-navy transition-[width] duration-300"
            style={{ width: `${Math.max(12, progress * 100)}%` }}
          />
        </div>
        <div className="flex gap-2">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scroll(dir)}
              disabled={dir === -1 ? edges.start : edges.end}
              aria-label={dir === -1 ? "Produtos anteriores" : "Próximos produtos"}
              className={cn(
                "grid size-12 place-items-center rounded-full border border-navy/20 text-navy transition-all duration-300 hover:border-navy hover:bg-navy hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30",
              )}
            >
              {dir === -1 ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
