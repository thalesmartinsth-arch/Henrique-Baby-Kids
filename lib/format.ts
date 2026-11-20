const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatPrice = (value: number) => brl.format(value);

export const MAX_INSTALLMENTS = 6;
export const MIN_INSTALLMENT = 30;

/** "6x de R$ 31,65 sem juros" — parcela mínima de R$ 30. */
export function installments(value: number) {
  const n = Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(value / MIN_INSTALLMENT)));
  return { count: n, value: value / n, label: `${n}x de ${formatPrice(value / n)} sem juros` };
}

export function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round((1 - price / compareAt) * 100);
}

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");
