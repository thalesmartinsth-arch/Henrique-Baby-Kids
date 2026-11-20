import { FREE_SHIPPING_THRESHOLD } from "./catalog";
import type { CartItem, Product } from "./types";

// Estimativas exibidas na loja. O valor final do pedido é recalculado no
// banco (função place_order), que confere preço, cupom, frete e estoque.

export type AppliedCoupon = { code: string; percent: number };

export type ShippingQuote = { label: string; days: string; price: number };

const SHIPPING_TABLE: Record<number, { price: number; days: string }> = {
  0: { price: 14.9, days: "2 a 4 dias úteis" },
  1: { price: 16.9, days: "2 a 5 dias úteis" },
  2: { price: 19.9, days: "3 a 6 dias úteis" },
  3: { price: 19.9, days: "3 a 6 dias úteis" },
  4: { price: 24.9, days: "4 a 7 dias úteis" },
  5: { price: 27.9, days: "5 a 8 dias úteis" },
  6: { price: 29.9, days: "6 a 9 dias úteis" },
  7: { price: 22.9, days: "4 a 7 dias úteis" },
  8: { price: 19.9, days: "3 a 6 dias úteis" },
  9: { price: 21.9, days: "3 a 6 dias úteis" },
};

/** Estimativa por faixa de CEP (primeiro dígito = região) — igual à função shipping_quote do banco. */
export function quoteShipping(cep: string, subtotal: number): ShippingQuote | null {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const row = SHIPPING_TABLE[Number(digits[0])];
  const free = subtotal >= FREE_SHIPPING_THRESHOLD;
  return { label: free ? "Frete grátis" : "Entrega econômica", days: row.days, price: free ? 0 : row.price };
}

export const formatCep = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

export type CartLine = CartItem & { product: Product; lineTotal: number; available: number };

export function resolveCart(items: CartItem[], byId: (id: string) => Product | undefined): CartLine[] {
  return items.flatMap((item) => {
    const product = byId(item.productId);
    if (!product || !product.sizes.includes(item.size)) return [];
    return [{ ...item, product, lineTotal: product.price * item.quantity, available: product.stock[item.size] ?? 0 }];
  });
}

export function cartTotals(lines: CartLine[], coupon: AppliedCoupon | null, shipping: ShippingQuote | null) {
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const discount = coupon ? Math.round(subtotal * coupon.percent) / 100 : 0;
  const shippingPrice = shipping ? (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shipping.price) : 0;
  const count = lines.reduce((s, l) => s + l.quantity, 0);
  return {
    subtotal,
    discount,
    coupon,
    shippingPrice,
    total: Math.max(0, subtotal - discount + shippingPrice),
    count,
    remainingForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}
