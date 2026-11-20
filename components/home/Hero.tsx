"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Pause, Play } from "lucide-react";
import { photo, PHOTOS } from "@/lib/images";
import { cn } from "@/lib/format";

const SLIDES = [
  {
    image: photo(PHOTOS.heroField),
    alt: "Duas crianças brincando em um campo aberto ao entardecer",
    label: "Coleção Jardim de Verão",
    href: "/colecoes#jardim-de-verao",
    position: "object-[60%_50%]",
  },
  {
    image: photo(PHOTOS.heroPair),
    alt: "Irmãos abraçados em um campo, vestindo roupas em tons neutros",
    label: "Pequenos Clássicos",
    href: "/colecoes#pequenos-classicos",
    position: "object-[50%_55%]",
  },
  {
    image: photo(PHOTOS.heroMeadow),
    alt: "Duas crianças caminhando de mãos dadas em um campo florido",
    label: "Novidades da estação",
    href: "/loja/novidades",
    position: "object-[50%_60%]",
  },
];

const DURATION = 7000;
const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), DURATION);
    return () => clearTimeout(t);
  }, [index, paused, reduce]);

  const slide = SLIDES[index];

  return (
    <section
      aria-label="Destaque"
      className="relative isolate h-[calc(100svh-108px)] min-h-[560px] overflow-hidden bg-navy lg:h-[calc(100svh-164px)] lg:min-h-[640px]"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.08 }}
            animate={{ scale: reduce ? 1.08 : 1 }}
            transition={{ duration: DURATION / 1000 + 1.5, ease: "linear" }}
          >
            <Image src={slide.image} alt={slide.alt} fill priority={index === 0} sizes="100vw" quality={80} className={cn("object-cover", slide.position)} />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Véu para leitura do texto */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/75 via-navy/25 to-navy/5 lg:bg-gradient-to-r lg:from-navy/70 lg:via-navy/25 lg:to-transparent" />

      <div className="wrap relative flex h-full flex-col justify-end pb-24 sm:pb-28 lg:justify-center lg:pb-0">
        <div className="max-w-[900px] text-white">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="mb-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/85"
          >
            <span className="h-px w-10 bg-rose" />
            Moda infantil · RN ao 12
          </motion.p>
          <h1 className="display text-[50px] sm:text-7xl lg:text-[84px] xl:text-[92px]">
            {["Pequenos momentos,", "grandes estilos."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  className={cn("block", i === 1 && "italic text-rose")}
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.25 + i * 0.12, ease }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease }}
            className="mt-6 max-w-md text-[16px] leading-relaxed text-white/85 sm:text-[17px]"
          >
            Moda infantil pensada para acompanhar cada descoberta, com conforto, personalidade e encanto.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/colecoes" className="btn btn-rose group">
              Conhecer coleção
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/loja/novidades" className="btn btn-ghost-light">
              Explorar novidades
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Indicadores */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="wrap flex items-center gap-4 pb-6 sm:pb-8">
          <div className="flex flex-1 gap-3 sm:max-w-md">
            {SLIDES.map((s, i) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Mostrar destaque ${i + 1}: ${s.label}`}
                aria-current={i === index}
                className="group flex min-h-11 flex-1 flex-col justify-center gap-2 text-left"
              >
                <span className="relative block h-[2px] overflow-hidden rounded-full bg-white/30">
                  {i === index ? (
                    <motion.span
                      key={`${index}-${paused}`}
                      className="absolute inset-y-0 left-0 bg-white"
                      initial={{ width: paused || reduce ? "100%" : "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: paused || reduce ? 0 : DURATION / 1000, ease: "linear" }}
                    />
                  ) : (
                    <span className={cn("absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/50", i < index && "bg-white/70")} />
                  )}
                </span>
                <span className={cn("hidden text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors sm:block", i === index ? "text-white" : "text-white/55 group-hover:text-white/80")}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Retomar apresentação" : "Pausar apresentação"}
            className="grid size-11 place-items-center rounded-full border border-white/40 text-white transition-colors hover:bg-white hover:text-navy"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
          <Link
            href={slide.href}
            className="group hidden items-center gap-3 rounded-[4px] bg-white/10 py-2 pl-4 pr-2 text-white backdrop-blur-md transition-colors hover:bg-white/20 md:flex"
          >
            <span className="text-[12px] font-semibold uppercase tracking-[0.16em]">{slide.label}</span>
            <span className="grid size-9 place-items-center rounded-full bg-white text-navy transition-transform group-hover:rotate-[-45deg]">
              <ArrowRight className="size-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
