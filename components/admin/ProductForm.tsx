"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { BABY_SIZES, CATEGORIES, KIDS_SIZES } from "@/lib/catalog";
import { cn, formatPrice } from "@/lib/format";
import { deleteProduct, saveProduct, type ProductInput } from "@/app/admin/actions";
import { useAction } from "./useAction";

type Variant = ProductInput["variants"][number];

export type ProductFormValue = Omit<ProductInput, "variants" | "compare_at_price"> & {
  compare_at_price: number | null;
  variants: Variant[];
};

const parseMoney = (s: string) => {
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};
const moneyStr = (n: number | null) => (n === null || n === undefined ? "" : n.toFixed(2).replace(".", ","));

export function ProductForm({ initial, collections }: { initial: ProductFormValue; collections: { slug: string; name: string }[] }) {
  const router = useRouter();
  const { pending, run } = useAction();
  const [v, setV] = useState(initial);
  const [price, setPrice] = useState(moneyStr(initial.price || null));
  const [compare, setCompare] = useState(moneyStr(initial.compare_at_price));
  const [cost, setCost] = useState(moneyStr(initial.cost_price || null));
  const [details, setDetails] = useState(initial.details.join("\n"));
  const isNew = !initial.id;

  const set = <K extends keyof ProductFormValue>(k: K, val: ProductFormValue[K]) => setV((s) => ({ ...s, [k]: val }));
  const setVariant = (i: number, patch: Partial<Variant>) =>
    setV((s) => ({ ...s, variants: s.variants.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
  const addSize = (size: string) =>
    setV((s) =>
      s.variants.some((x) => x.size === size)
        ? s
        : { ...s, variants: [...s.variants, { size, sku: null, stock: 0, low_stock_threshold: 2 }] },
    );

  const p = parseMoney(price);
  const c = parseMoney(cost);
  const margin = p > 0 ? ((p - c) / p) * 100 : 0;
  const totalStock = v.variants.reduce((s, x) => s + (x.stock || 0), 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    run(
      () =>
        saveProduct({
          ...v,
          price: p,
          compare_at_price: compare.trim() ? parseMoney(compare) : null,
          cost_price: c,
          details: details.split("\n").map((d) => d.trim()).filter(Boolean),
        }),
      {
        onSuccess: (res) => {
          if (isNew && res.id) router.push(`/admin/produtos/${res.id}?novo=1`);
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <section className="adm-card space-y-4">
          <h2 className="adm-h2">Informações</h2>
          <div>
            <label htmlFor="p-name" className="adm-label">Nome</label>
            <input id="p-name" required value={v.name} onChange={(e) => set("name", e.target.value)} className="adm-input" />
          </div>
          <div>
            <label htmlFor="p-slug" className="adm-label">Endereço na loja</label>
            <div className="flex items-center rounded-[var(--radius-btn)] border border-line bg-mist/40 pl-3 text-sm text-navy-soft focus-within:border-sky-deep">
              /produto/
              <input
                id="p-slug"
                value={v.slug ?? ""}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="gerado a partir do nome"
                className="h-10 min-w-0 flex-1 bg-transparent pr-3 text-navy outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="p-short" className="adm-label">Resumo (aparece abaixo do nome)</label>
            <input id="p-short" value={v.short_description} onChange={(e) => set("short_description", e.target.value)} maxLength={200} className="adm-input" />
          </div>
          <div>
            <label htmlFor="p-desc" className="adm-label">Descrição</label>
            <textarea id="p-desc" rows={5} value={v.description} onChange={(e) => set("description", e.target.value)} className="adm-input h-auto py-2" />
          </div>
          <div>
            <label htmlFor="p-details" className="adm-label">Detalhes (um por linha)</label>
            <textarea id="p-details" rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder={"Composição: 100% algodão\nBotões de pressão"} className="adm-input h-auto py-2" />
          </div>
        </section>

        <section className="adm-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="adm-h2">Tamanhos e estoque</h2>
            <span className="text-[12px] text-navy-soft">{totalStock} peças no total</span>
          </div>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {[...BABY_SIZES, ...KIDS_SIZES].map((s) => {
              const has = v.variants.some((x) => x.size === s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSize(s)}
                  disabled={has}
                  className={cn(
                    "inline-flex h-8 min-w-9 items-center justify-center gap-1 rounded-[3px] border px-2 text-[12px] font-semibold transition-colors",
                    has ? "border-navy bg-navy text-white" : "border-line hover:border-navy",
                  )}
                >
                  {!has && <Plus className="size-3" />}
                  {s}
                </button>
              );
            })}
          </div>
          {v.variants.length ? (
            <div className="-mx-5 overflow-x-auto sm:-mx-6">
              <table className="adm-table min-w-[520px]">
                <thead>
                  <tr>
                    <th className="pl-5">Tamanho</th>
                    <th>SKU</th>
                    <th>Estoque</th>
                    <th>Alerta abaixo de</th>
                    <th className="pr-5" />
                  </tr>
                </thead>
                <tbody>
                  {v.variants.map((x, i) => (
                    <tr key={x.id ?? x.size}>
                      <td className="pl-5">
                        <input aria-label="Tamanho" value={x.size} onChange={(e) => setVariant(i, { size: e.target.value.toUpperCase() })} className="adm-input w-20" />
                      </td>
                      <td>
                        <input aria-label={`SKU do tamanho ${x.size}`} value={x.sku ?? ""} onChange={(e) => setVariant(i, { sku: e.target.value || null })} className="adm-input w-36" />
                      </td>
                      <td>
                        <input
                          aria-label={`Estoque do tamanho ${x.size}`}
                          type="number"
                          min={0}
                          value={x.stock}
                          onChange={(e) => setVariant(i, { stock: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                          className="adm-input w-24"
                        />
                      </td>
                      <td>
                        <input
                          aria-label={`Alerta de estoque do tamanho ${x.size}`}
                          type="number"
                          min={0}
                          value={x.low_stock_threshold}
                          onChange={(e) => setVariant(i, { low_stock_threshold: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
                          className="adm-input w-20"
                        />
                      </td>
                      <td className="pr-5 text-right">
                        <button
                          type="button"
                          onClick={() => setV((s) => ({ ...s, variants: s.variants.filter((_, j) => j !== i) }))}
                          aria-label={`Remover tamanho ${x.size}`}
                          className="grid size-9 place-items-center rounded-full text-navy/50 hover:bg-blush hover:text-rose-deep"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-navy-soft">Clique nos tamanhos acima para adicionar.</p>
          )}
          <p className="mt-3 text-[12px] text-navy-soft">Mudanças no estoque ficam registradas no histórico de movimentações.</p>
        </section>
      </div>

      <div className="space-y-4">
        <section className="adm-card space-y-4">
          <h2 className="adm-h2">Publicação</h2>
          <div>
            <label htmlFor="p-status" className="adm-label">Status</label>
            <select id="p-status" value={v.status} onChange={(e) => set("status", e.target.value as ProductFormValue["status"])} className="adm-input">
              <option value="active">Ativo (visível na loja)</option>
              <option value="draft">Rascunho (oculto)</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-[13px]">
            <input type="checkbox" checked={v.is_new} onChange={(e) => set("is_new", e.target.checked)} className="size-4 accent-navy" />
            Marcar como novidade
          </label>
          <label className="flex items-center gap-2 text-[13px]">
            <input type="checkbox" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4 accent-navy" />
            Destacar na página inicial
          </label>
          <div>
            <label htmlFor="p-date" className="adm-label">Data de lançamento</label>
            <input id="p-date" type="date" value={v.released_at} onChange={(e) => set("released_at", e.target.value)} className="adm-input" />
          </div>
        </section>

        <section className="adm-card space-y-4">
          <h2 className="adm-h2">Preço</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="p-price" className="adm-label">Preço de venda</label>
              <input id="p-price" inputMode="decimal" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" className="adm-input" />
            </div>
            <div>
              <label htmlFor="p-compare" className="adm-label">Preço “de” (opcional)</label>
              <input id="p-compare" inputMode="decimal" value={compare} onChange={(e) => setCompare(e.target.value)} placeholder="0,00" className="adm-input" />
            </div>
          </div>
          <div>
            <label htmlFor="p-cost" className="adm-label">Custo da peça</label>
            <input id="p-cost" inputMode="decimal" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0,00" className="adm-input" />
          </div>
          <p className="rounded-[3px] bg-ivory px-3 py-2 text-[12px] text-navy-soft">
            Lucro por peça <strong className="text-navy">{formatPrice(Math.max(0, p - c))}</strong> · margem{" "}
            <strong className={margin < 30 ? "text-rose-deep" : "text-navy"}>{margin.toFixed(0)}%</strong>
          </p>
        </section>

        <section className="adm-card space-y-4">
          <h2 className="adm-h2">Organização</h2>
          <fieldset>
            <legend className="adm-label">Categorias</legend>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((cat) => (
                <label key={cat.slug} className="flex items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={v.categories.includes(cat.slug)}
                    onChange={(e) =>
                      set("categories", e.target.checked ? [...v.categories, cat.slug] : v.categories.filter((x) => x !== cat.slug))
                    }
                    className="size-4 accent-navy"
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="p-col" className="adm-label">Coleção</label>
            <select id="p-col" value={v.collection_slug ?? ""} onChange={(e) => set("collection_slug", e.target.value || null)} className="adm-input">
              <option value="">Sem coleção</option>
              {collections.map((col) => (
                <option key={col.slug} value={col.slug}>{col.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="p-color" className="adm-label">Cor</label>
            <input id="p-color" value={v.color} onChange={(e) => set("color", e.target.value)} className="adm-input" />
          </div>
        </section>

        <div className="sticky bottom-4 space-y-2">
          <button type="submit" disabled={pending} className="btn btn-primary w-full">
            {pending ? "Salvando…" : isNew ? "Criar produto" : "Salvar alterações"}
          </button>
          {!isNew && (
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm("Excluir este produto e suas fotos? Essa ação não pode ser desfeita.")) return;
                run(() => deleteProduct(initial.id!), { success: "Produto excluído", onSuccess: () => router.push("/admin/produtos") });
              }}
              className="btn w-full text-rose-deep hover:bg-blush"
            >
              Excluir produto
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
