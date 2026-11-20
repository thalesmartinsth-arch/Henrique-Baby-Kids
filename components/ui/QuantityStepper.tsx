"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/format";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
};

export function QuantityStepper({ value, onChange, min = 1, max = 10, size = "md", label = "Quantidade" }: Props) {
  const h = size === "sm" ? "h-9" : "h-12";
  const w = size === "sm" ? "w-9" : "w-11";
  return (
    <div className={cn("inline-flex items-center rounded-[3px] border border-line bg-white", h)} role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={cn("grid h-full place-items-center text-navy transition-colors hover:bg-blush disabled:opacity-30", w)}
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={cn("grid h-full place-items-center text-navy transition-colors hover:bg-blush disabled:opacity-30", w)}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
