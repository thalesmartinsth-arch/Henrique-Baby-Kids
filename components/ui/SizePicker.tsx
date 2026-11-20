"use client";

import { cn } from "@/lib/format";

type Props = {
  sizes: string[];
  soldOut?: string[];
  value: string | null;
  onChange: (size: string) => void;
  compact?: boolean;
  invalid?: boolean;
  label?: string;
};

export function SizePicker({ sizes, soldOut = [], value, onChange, compact, invalid, label = "Tamanho" }: Props) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap", compact ? "gap-1.5" : "gap-2", invalid && "animate-shake")}>
      {sizes.map((size) => {
        const disabled = soldOut.includes(size);
        const active = value === size;
        return (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={disabled ? `${size} — esgotado` : `Tamanho ${size}`}
            disabled={disabled}
            onClick={() => onChange(size)}
            className={cn(
              "relative grid place-items-center rounded-[3px] border font-medium transition-all duration-200",
              compact ? "h-8 min-w-8 px-1.5 text-[11px]" : "h-12 min-w-12 px-3 text-sm",
              active
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-navy hover:-translate-y-px hover:border-navy",
              invalid && !active && "border-rose-deep/60",
              disabled &&
                "cursor-not-allowed border-line bg-mist/50 text-navy/30 hover:translate-y-0 hover:border-line after:absolute after:inset-x-1 after:top-1/2 after:h-px after:-rotate-[20deg] after:bg-navy/25",
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
