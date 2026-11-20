"use client";

import { create } from "zustand";
import { useSyncExternalStore } from "react";

export type Toast = { id: number; title: string; description?: string; image?: string; tone?: "default" | "error" };

type UIState = {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  toasts: Toast[];
  /** Incrementado a cada item adicionado — anima o ícone da sacola. */
  bagPulse: number;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  notify: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
  pulseBag: () => void;
};

let toastId = 0;

export const useUI = create<UIState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  toasts: [],
  bagPulse: 0,
  setCartOpen: (cartOpen) => set({ cartOpen, searchOpen: false, menuOpen: false }),
  setSearchOpen: (searchOpen) => set({ searchOpen, cartOpen: false, menuOpen: false }),
  setMenuOpen: (menuOpen) => set({ menuOpen, cartOpen: false, searchOpen: false }),
  notify: (toast) => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  pulseBag: () => set((s) => ({ bagPulse: s.bagPulse + 1 })),
}));

const subscribe = () => () => {};
/** true só no cliente — evita divergência de hidratação em dados do localStorage. */
export const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
