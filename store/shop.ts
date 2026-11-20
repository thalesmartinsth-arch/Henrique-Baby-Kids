"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AppliedCoupon } from "@/lib/pricing";
import type { CartItem } from "@/lib/types";

const MAX_QTY = 10;

type ShopState = {
  cart: CartItem[];
  favorites: string[];
  coupon: AppliedCoupon | null;
  cep: string;
  addToCart: (productId: string, size: string, quantity?: number, max?: number) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => boolean;
  setCoupon: (coupon: AppliedCoupon | null) => void;
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

      addToCart: (productId, size, quantity = 1, max = MAX_QTY) =>
        set((s) => {
          const limit = Math.min(MAX_QTY, max);
          const existing = s.cart.find((i) => i.productId === productId && i.size === size);
          if (existing) {
            return {
              cart: s.cart.map((i) => (i === existing ? { ...i, quantity: Math.min(limit, i.quantity + quantity) } : i)),
            };
          }
          return { cart: [{ productId, size, quantity: Math.min(limit, quantity) }, ...s.cart] };
        }),

      setQuantity: (productId, size, quantity) =>
        set((s) => ({
          cart:
            quantity <= 0
              ? s.cart.filter((i) => !(i.productId === productId && i.size === size))
              : s.cart.map((i) =>
                  i.productId === productId && i.size === size ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i,
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

      setCoupon: (coupon) => set({ coupon }),
      setCep: (cep) => set({ cep }),
    }),
    {
      name: "hbk-shop",
      // v2: ids passaram a ser UUIDs do banco — itens antigos são descartados.
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: () => ({ cart: [], favorites: [], coupon: null, cep: "" }),
    },
  ),
);
