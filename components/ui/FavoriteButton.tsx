"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/format";
import { useToggleFavorite } from "@/lib/hooks";
import { useShop } from "@/store/shop";
import { useHydrated } from "@/store/ui";

export function FavoriteButton({ productId, className, withLabel }: { productId: string; className?: string; withLabel?: boolean }) {
  const hydrated = useHydrated();
  const isFav = useShop((s) => s.favorites.includes(productId)) && hydrated;
  const toggle = useToggleFavorite();

  return (
    <button
      type="button"
      aria-pressed={isFav}
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={cn(
        "group/fav inline-flex items-center justify-center gap-2 transition-all duration-300",
        withLabel
          ? "btn btn-outline"
          : "size-11 rounded-full bg-white/90 text-navy shadow-[0_4px_16px_-8px_rgba(38,59,85,0.4)] backdrop-blur hover:scale-105 hover:bg-white",
        className,
      )}
    >
      <motion.span
        key={String(isFav)}
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 15 }}
        className="inline-flex"
      >
        <Heart
          className={cn("size-[18px] transition-colors", isFav ? "fill-rose-deep text-rose-deep" : "group-hover/fav:text-rose-deep")}
          strokeWidth={1.6}
        />
      </motion.span>
      {withLabel && (isFav ? "Nos favoritos" : "Favoritar")}
    </button>
  );
}
