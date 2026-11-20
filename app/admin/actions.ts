"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin, serverClient } from "@/lib/supabase/server";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/env";

// Toda ação confere a sessão de admin; as políticas RLS do banco
// garantem a mesma regra mesmo que alguém chame a API direto.

type Result = { ok: true; message?: string; id?: string } | { ok: false; error: string };

function refreshStore() {
  revalidatePath("/", "layout");
}

const fail = (error: unknown): Result => ({
  ok: false,
  error: error instanceof Error ? error.message : typeof error === "string" ? error : "Algo deu errado.",
});

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const productSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(2, "Informe o nome").max(120),
  slug: z.string().trim().max(140).optional(),
  short_description: z.string().trim().max(200),
  description: z.string().trim().max(4000),
  details: z.array(z.string().trim().min(1).max(200)).max(20),
  price: z.number().min(0),
  compare_at_price: z.number().min(0).nullable(),
  cost_price: z.number().min(0),
  categories: z.array(z.enum(["meninas", "meninos", "bebes", "conjuntos", "vestidos", "acessorios"])).min(1, "Escolha ao menos uma categoria"),
  collection_slug: z.string().nullable(),
  color: z.string().trim().max(60),
  is_new: z.boolean(),
  featured: z.boolean(),
  status: z.enum(["active", "draft", "archived"]),
  released_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  variants: z
    .array(
      z.object({
        id: z.uuid().optional(),
        size: z.string().trim().min(1).max(10),
        sku: z.string().trim().max(40).nullable(),
        stock: z.number().int().min(0).max(100000),
        low_stock_threshold: z.number().int().min(0).max(1000),
      }),
    )
    .min(1, "Cadastre ao menos um tamanho"),
});

export type ProductInput = z.infer<typeof productSchema>;

export async function saveProduct(input: ProductInput): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  const { variants, id, ...data } = parsed.data;
  const sizes = variants.map((v) => v.size.toUpperCase());
  if (new Set(sizes).size !== sizes.length) return { ok: false, error: "Há tamanhos repetidos." };
  if (data.compare_at_price !== null && data.compare_at_price <= data.price) data.compare_at_price = null;
  const row = { ...data, slug: slugify(data.slug || data.name) };

  try {
    let productId = id;
    if (productId) {
      const { error } = await supabase.from("products").update(row).eq("id", productId);
      if (error) throw new Error(error.code === "23505" ? "Já existe um produto com esse endereço (slug)." : error.message);
    } else {
      const { data: created, error } = await supabase.from("products").insert(row).select("id").single();
      if (error) throw new Error(error.code === "23505" ? "Já existe um produto com esse endereço (slug)." : error.message);
      productId = created.id;
    }

    // Variantes: atualiza, cria e remove; mudanças de estoque viram movimentações.
    const { data: current } = await supabase.from("product_variants").select("id, size, stock").eq("product_id", productId!);
    const currentById = new Map((current ?? []).map((v) => [v.id, v]));
    const keep = new Set<string>();

    for (const [position, v] of variants.entries()) {
      if (v.id && currentById.has(v.id)) {
        keep.add(v.id);
        const before = currentById.get(v.id)!;
        const { error } = await supabase
          .from("product_variants")
          .update({ size: v.size, sku: v.sku, low_stock_threshold: v.low_stock_threshold, position })
          .eq("id", v.id);
        if (error) throw new Error(error.message);
        const delta = v.stock - before.stock;
        if (delta !== 0) {
          const { error: e2 } = await supabase.rpc("adjust_stock", {
            p_variant_id: v.id,
            p_delta: delta,
            p_reason: "adjustment",
            p_note: "Ajuste no cadastro do produto",
          });
          if (e2) throw new Error(e2.message);
        }
      } else {
        const { data: nv, error } = await supabase
          .from("product_variants")
          .insert({ product_id: productId!, size: v.size, sku: v.sku, stock: 0, low_stock_threshold: v.low_stock_threshold, position })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        keep.add(nv.id);
        if (v.stock > 0) {
          const { error: e2 } = await supabase.rpc("adjust_stock", {
            p_variant_id: nv.id,
            p_delta: v.stock,
            p_reason: "restock",
            p_note: "Estoque inicial",
          });
          if (e2) throw new Error(e2.message);
        }
      }
    }
    const toRemove = (current ?? []).filter((v) => !keep.has(v.id)).map((v) => v.id);
    if (toRemove.length) {
      const { error } = await supabase.from("product_variants").delete().in("id", toRemove);
      if (error) throw new Error(error.message);
    }

    refreshStore();
    revalidatePath("/admin/produtos");
    return { ok: true, id: productId, message: id ? "Produto salvo" : "Produto criado" };
  } catch (e) {
    return fail(e);
  }
}

export async function setProductStatus(id: string, status: "active" | "draft" | "archived"): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").update({ status }).eq("id", id);
  if (error) return fail(error.message);
  refreshStore();
  revalidatePath("/admin/produtos");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { count } = await supabase.from("order_items").select("id", { count: "exact", head: true }).eq("product_id", id);
  if (count) return { ok: false, error: "Este produto tem pedidos. Arquive em vez de excluir para manter o histórico." };
  const { data: images } = await supabase.from("product_images").select("storage_path").eq("product_id", id);
  const paths = (images ?? []).map((i) => i.storage_path).filter((p): p is string => !!p);
  if (paths.length) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return fail(error.message);
  refreshStore();
  revalidatePath("/admin/produtos");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Imagens (o arquivo é enviado pelo navegador direto ao Storage)
// ---------------------------------------------------------------------------

export async function addProductImages(productId: string, images: { url: string; storage_path: string; alt: string }[]): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { data: last } = await supabase
    .from("product_images")
    .select("position")
    .eq("product_id", productId)
    .order("position", { ascending: false })
    .limit(1);
  const start = (last?.[0]?.position ?? -1) + 1;
  const { error } = await supabase
    .from("product_images")
    .insert(images.map((img, i) => ({ product_id: productId, ...img, position: start + i })));
  if (error) return fail(error.message);
  refreshStore();
  revalidatePath(`/admin/produtos/${productId}`);
  return { ok: true };
}

export async function addImageByUrl(productId: string, url: string, alt: string): Promise<Result> {
  const parsed = z.url({ protocol: /^https$/ }).safeParse(url.trim());
  if (!parsed.success) return { ok: false, error: "Informe um endereço https:// válido." };
  return addProductImages(productId, [{ url: parsed.data, storage_path: "", alt }]);
}

export async function deleteProductImage(imageId: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { data: img } = await supabase.from("product_images").select("storage_path, product_id").eq("id", imageId).single();
  if (img?.storage_path) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([img.storage_path]);
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) return fail(error.message);
  refreshStore();
  if (img) revalidatePath(`/admin/produtos/${img.product_id}`);
  return { ok: true };
}

export async function reorderProductImages(productId: string, orderedIds: string[]): Promise<Result> {
  const { supabase } = await requireAdmin();
  for (const [position, id] of orderedIds.entries()) {
    const { error } = await supabase.from("product_images").update({ position }).eq("id", id).eq("product_id", productId);
    if (error) return fail(error.message);
  }
  refreshStore();
  revalidatePath(`/admin/produtos/${productId}`);
  return { ok: true };
}

export async function updateImageAlt(imageId: string, alt: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("product_images").update({ alt: alt.slice(0, 200) }).eq("id", imageId);
  if (error) return fail(error.message);
  refreshStore();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Estoque
// ---------------------------------------------------------------------------

export async function adjustStock(variantId: string, delta: number, reason: "restock" | "adjustment" | "return", note: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!Number.isInteger(delta) || delta === 0) return { ok: false, error: "Informe uma quantidade diferente de zero." };
  const { error } = await supabase.rpc("adjust_stock", { p_variant_id: variantId, p_delta: delta, p_reason: reason, p_note: note.slice(0, 200) });
  if (error) return fail(/check constraint|stock_check/.test(error.message) ? "O estoque não pode ficar negativo." : error.message);
  refreshStore();
  revalidatePath("/admin/estoque");
  return { ok: true, message: "Estoque atualizado" };
}

// ---------------------------------------------------------------------------
// Pedidos
// ---------------------------------------------------------------------------

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

export async function setOrderStatus(orderId: string, status: (typeof ORDER_STATUSES)[number]): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: "Status inválido" };
  const { error } = await supabase.rpc("set_order_status", { p_order_id: orderId, p_status: status });
  if (error) return fail(error.message);
  if (status === "cancelled") refreshStore();
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true, message: "Status atualizado" };
}

export async function updateOrderNotes(orderId: string, adminNotes: string, trackingCode: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("orders")
    .update({ admin_notes: adminNotes.slice(0, 2000), tracking_code: trackingCode.trim().slice(0, 60) || null })
    .eq("id", orderId);
  if (error) return fail(error.message);
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { ok: true, message: "Pedido atualizado" };
}

// ---------------------------------------------------------------------------
// Cupons
// ---------------------------------------------------------------------------

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_-]{3,30}$/, "Use de 3 a 30 letras, números, - ou _"),
  description: z.string().trim().max(120),
  percent: z.number().int().min(1).max(90),
  max_uses: z.number().int().min(1).nullable(),
  min_subtotal: z.number().min(0),
  starts_at: z.string().nullable(),
  ends_at: z.string().nullable(),
  active: z.boolean(),
});

export async function saveCoupon(input: z.input<typeof couponSchema>, isNew: boolean): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  const q = isNew ? supabase.from("coupons").insert(parsed.data) : supabase.from("coupons").update(parsed.data).eq("code", parsed.data.code);
  const { error } = await q;
  if (error) return fail(error.code === "23505" ? "Já existe um cupom com esse código." : error.message);
  revalidatePath("/admin/cupons");
  return { ok: true, message: "Cupom salvo" };
}

export async function toggleCoupon(code: string, active: boolean): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("coupons").update({ active }).eq("code", code);
  if (error) return fail(error.message);
  revalidatePath("/admin/cupons");
  return { ok: true };
}

export async function deleteCoupon(code: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("coupons").delete().eq("code", code);
  if (error) return fail(error.message);
  revalidatePath("/admin/cupons");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Despesas
// ---------------------------------------------------------------------------

const expenseSchema = z.object({
  description: z.string().trim().min(2, "Descreva a despesa").max(160),
  category: z.enum(["mercadoria", "frete", "embalagem", "marketing", "taxas", "aluguel", "pessoal", "outros"]),
  amount: z.number().positive("Valor deve ser maior que zero"),
  spent_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function addExpense(input: z.input<typeof expenseSchema>): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = expenseSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  const { error } = await supabase.from("expenses").insert(parsed.data);
  if (error) return fail(error.message);
  revalidatePath("/admin/financeiro");
  return { ok: true, message: "Despesa lançada" };
}

export async function deleteExpense(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/financeiro");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Coleções
// ---------------------------------------------------------------------------

const collectionSchema = z.object({
  slug: z.string().trim().optional(),
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400),
  image_url: z.string().trim().nullable(),
  position: z.number().int().min(0),
});

export async function saveCollection(input: z.input<typeof collectionSchema>, originalSlug?: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = collectionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  const row = { ...parsed.data, slug: slugify(parsed.data.slug || parsed.data.name) };
  const { error } = originalSlug
    ? await supabase.from("collections").update(row).eq("slug", originalSlug)
    : await supabase.from("collections").insert(row);
  if (error) return fail(error.code === "23505" ? "Já existe uma coleção com esse nome." : error.message);
  refreshStore();
  revalidatePath("/admin/colecoes");
  return { ok: true, message: "Coleção salva" };
}

export async function deleteCollection(slug: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("collections").delete().eq("slug", slug);
  if (error) return fail(error.message);
  refreshStore();
  revalidatePath("/admin/colecoes");
  return { ok: true };
}
