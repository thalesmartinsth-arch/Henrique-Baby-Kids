"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { publicClient } from "@/lib/supabase/public";

// Ações públicas da loja. Toda regra de negócio sensível (preço, estoque,
// cupom, frete) roda dentro das funções do banco, não aqui.

export async function validateCoupon(code: string, subtotal: number) {
  const parsed = z.string().trim().min(2).max(40).safeParse(code);
  if (!parsed.success) return { ok: false as const, error: "Digite um cupom válido." };
  const { data, error } = await publicClient().rpc("check_coupon", { p_code: parsed.data, p_subtotal: subtotal });
  if (error) return { ok: false as const, error: "Não foi possível validar o cupom agora." };
  const coupon = (data as { code: string; percent: number }[] | null)?.[0];
  if (!coupon) return { ok: false as const, error: "Cupom inválido, expirado ou fora das regras." };
  return { ok: true as const, coupon: { code: coupon.code, percent: coupon.percent } };
}

export async function subscribeNewsletter(email: string) {
  const parsed = z.email().safeParse(email.trim());
  if (!parsed.success) return { ok: false as const, error: "Digite um e-mail válido." };
  const { error } = await publicClient().rpc("subscribe_newsletter", { p_email: parsed.data });
  if (error) return { ok: false as const, error: "Não foi possível cadastrar agora. Tente de novo." };
  return { ok: true as const };
}

const orderSchema = z.object({
  customer_name: z.string().trim().min(3).max(120),
  customer_email: z.email(),
  customer_phone: z.string().trim().min(10).max(20),
  payment_method: z.enum(["pix", "cartao", "boleto"]),
  coupon_code: z.string().trim().max(40).optional(),
  address: z.object({
    cep: z.string().regex(/^\d{5}-?\d{3}$/),
    street: z.string().trim().min(2).max(160),
    number: z.string().trim().min(1).max(20),
    complement: z.string().trim().max(80).optional(),
    district: z.string().trim().min(2).max(80),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().length(2),
  }),
  items: z
    .array(z.object({ product_id: z.uuid(), size: z.string().min(1).max(10), quantity: z.number().int().min(1).max(10) }))
    .min(1)
    .max(50),
});

export type OrderPayload = z.infer<typeof orderSchema>;

export async function placeOrder(payload: OrderPayload) {
  const parsed = orderSchema.safeParse(payload);
  if (!parsed.success) return { ok: false as const, error: "Confira os dados do pedido." };
  const { data, error } = await publicClient().rpc("place_order", { payload: parsed.data });
  if (error) {
    const known = /Estoque insuficiente|indisponível|Sacola vazia|CEP inválido|Quantidade inválida/.test(error.message);
    return { ok: false as const, error: known ? error.message : "Não foi possível concluir o pedido. Tente novamente." };
  }
  const row = (data as { order_number: number; total: number }[])[0];
  // Estoque mudou: atualiza as páginas da vitrine.
  revalidatePath("/", "layout");
  return { ok: true as const, number: row.order_number, total: Number(row.total) };
}
