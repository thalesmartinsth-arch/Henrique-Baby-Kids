"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getProductById } from "@/lib/catalog";
import { findCoupon } from "@/lib/pricing";
import type { CartItem } from "@/lib/types";

const MAX_QTY = 10;

type ShopState = {
  cart: CartItem[];
  favorites: string[];
  coupon: string | null;
  cep: string;
  addToCart: (productId: string, size: string, quantity?: number) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => boolean;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setCep: (cep: string) => void;
};

/** Carrinho, favoritos, cupom e CEP — persistidos no localStorage. */
export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      favorites: [],
      coupon: null,
      cep: "",

      addToCart: (productId, size, quantity = 1) =>
        set((s) => {
          const existing = s.cart.find((i) => i.productId === productId && i.size === size);
          if (existing) {
            return {
              cart: s.cart.map((i) =>
                i === existing ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) } : i,
              ),
            };
          }
          return { cart: [{ productId, size, quantity: Math.min(MAX_QTY, quantity) }, ...s.cart] };
        }),

      setQuantity: (productId, size, quantity) =>
        set((s) => ({
          cart:
            quantity <= 0
              ? s.cart.filter((i) => !(i.productId === productId && i.size === size))
              : s.cart.map((i) =>
                  i.productId === productId && i.size === size
                    ? { ...i, quantity: Math.min(MAX_QTY, quantity) }
                    : i,
                ),
        })),

      removeFromCart: (productId, size) =>
        set((s) => ({ cart: s.cart.filter((i) => !(i.productId === productId && i.size === size)) })),

      clearCart: () => set({ cart: [], coupon: null }),

      toggleFavorite: (productId) => {
        const isFav = get().favorites.includes(productId);
        set((s) => ({
          favorites: isFav ? s.favorites.filter((id) => id !== productId) : [productId, ...s.favorites],
        }));
        return !isFav;
      },

      applyCoupon: (code) => {
        const coupon = findCoupon(code);
        if (!coupon) return false;
        set({ coupon: coupon.code });
        return true;
      },
      removeCoupon: () => set({ coupon: null }),
      setCep: (cep) => set({ cep }),
    }),
    {
      name: "hbk-shop",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Descarta itens de produtos que saíram do catálogo.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ShopState>;
        return {
          ...current,
          ...p,
          cart: (p.cart ?? []).filter((i) => getProductById(i.productId)?.sizes.includes(i.size)),
          favorites: (p.favorites ?? []).filter((id) => getProductById(id)),
        };
      },
    },
  ),
);
