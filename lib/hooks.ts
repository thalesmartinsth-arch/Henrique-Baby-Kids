"use client";

import { useEffect } from "react";
import { getProductById } from "./catalog";
import { useShop } from "@/store/shop";
import { useUI } from "@/store/ui";

/** Adiciona ao carrinho com feedback visual (toast + pulso na sacola). */
export function useAddToCart() {
  const add = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const pulse = useUI((s) => s.pulseBag);
  const setCartOpen = useUI((s) => s.setCartOpen);

  return (productId: string, size: string, quantity = 1, opts: { openCart?: boolean } = {}) => {
    const product = getProductById(productId);
    if (!product) return;
    add(productId, size, quantity);
    pulse();
    if (opts.openCart) {
      setCartOpen(true);
    } else {
      notify({
        title: "Adicionado à sacola",
        description: `${product.name} · Tam. ${size}`,
        image: product.images[0].src,
      });
    }
  };
}

export function useToggleFavorite() {
  const toggle = useShop((s) => s.toggleFavorite);
  const notify = useUI((s) => s.notify);
  return (productId: string) => {
    const product = getProductById(productId);
    const added = toggle(productId);
    notify({
      title: added ? "Salvo nos favoritos" : "Removido dos favoritos",
      description: product?.name,
      image: product?.images[0].src,
    });
  };
}

/** Trava o scroll da página enquanto um painel está aberto. */
export function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

export function useEscape(onEscape: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onEscape();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onEscape, active]);
}
