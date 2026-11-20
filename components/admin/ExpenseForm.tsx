"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { addExpense, deleteExpense } from "@/app/admin/actions";
import { useAction } from "./useAction";

export const EXPENSE_CATEGORIES: Record<string, string> = {
  mercadoria: "Compra de mercadoria",
  frete: "Frete e envio",
  embalagem: "Embalagens",
  marketing: "Marketing e anúncios",
  taxas: "Taxas e tarifas",
  aluguel: "Aluguel e contas",
  pessoal: "Pessoal",
  outros: "Outros",
};

export function ExpenseForm() {
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({ description: "", category: "mercadoria", amount: "", spent_on: today });
  const { pending, run } = useAction();
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(
          () =>
            addExpense({
              description: f.description,
              category: f.category as "outros",
              amount: Number(f.amount.replace(/\./g, "").replace(",", ".")),
              spent_on: f.spent_on,
            }),
          { onSuccess: () => setF((s) => ({ ...s, description: "", amount: "" })) },
        );
      }}
    >
      <div className="sm:col-span-2">
        <label htmlFor="e-desc" className="adm-label">Descrição</label>
        <input id="e-desc" required value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Ex.: Reposição de vestidos" className="adm-input" />
      </div>
      <div>
        <label htmlFor="e-cat" className="adm-label">Categoria</label>
        <select id="e-cat" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className="adm-input">
          {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="e-amount" className="adm-label">Valor (R$)</label>
        <input id="e-amount" required inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="0,00" className="adm-input" />
      </div>
      <div>
        <label htmlFor="e-date" className="adm-label">Data</label>
        <input id="e-date" type="date" value={f.spent_on} onChange={(e) => setF({ ...f, spent_on: e.target.value })} className="adm-input" />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={pending} className="btn btn-primary btn-sm w-full">{pending ? "Salvando…" : "Lançar despesa"}</button>
      </div>
    </form>
  );
}

export function DeleteExpenseButton({ id }: { id: string }) {
  const { pending, run } = useAction();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => confirm("Excluir esta despesa?") && run(() => deleteExpense(id), { success: "Despesa excluída" })}
      aria-label="Excluir despesa"
      className="grid size-8 place-items-center rounded-full text-navy/40 hover:bg-blush hover:text-rose-deep"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
