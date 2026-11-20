"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/format";

/** Galeria com miniaturas, zoom que segue o cursor (desktop) e deslize por toque (mobile). */
export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const touchX = useRef<number | null>(null);
  const go = (dir: number) => setActive((i) => (i + dir + images.length) % images.length);

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto lg:w-[88px] lg:flex-col" role="tablist" aria-label="Imagens do produto">
          {images.map((img, i) => (
            <button
              key={img.src}
              role="tab"
              aria-selected={i === active}
              aria-label={`Imagem ${i + 1} de ${images.length}`}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[3/4] w-[72px] shrink-0 overflow-hidden rounded-[3px] bg-mist transition-all duration-300 lg:w-full",
                i === active ? "ring-1 ring-navy ring-offset-2 ring-offset-ivory" : "opacity-60 hover:opacity-100",
              )}
            >
              <Image src={img.src} alt="" fill sizes="88px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className="group relative aspect-[4/5] flex-1 overflow-hidden rounded-[var(--radius-card)] bg-mist lg:cursor-zoom-in"
        onMouseMove={(e) => {
          if (window.matchMedia("(hover: none)").matches) return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={active}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={images[active].src}
              alt={images[active].alt}
              fill
              priority={active === 0}
              quality={85}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 ease-out"
              style={zoom ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </motion.div>
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
              <button type="button" onClick={() => go(-1)} aria-label="Imagem anterior" className="grid size-11 place-items-center rounded-full bg-white/90 text-navy shadow backdrop-blur transition-transform hover:scale-105">
                <ChevronLeft className="size-5" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Próxima imagem" className="grid size-11 place-items-center rounded-full bg-white/90 text-navy shadow backdrop-blur transition-transform hover:scale-105">
                <ChevronRight className="size-5" />
              </button>
            </div>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden" aria-hidden>
              {images.map((_, i) => (
                <span key={i} className={cn("h-1 rounded-full bg-white transition-all", i === active ? "w-6" : "w-1.5 opacity-60")} />
              ))}
            </div>
          </>
        )}
        <span className="sr-only">{name}</span>
      </div>
    </div>
  );
}
