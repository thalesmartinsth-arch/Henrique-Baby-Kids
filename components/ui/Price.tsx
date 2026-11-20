import { cn, discountPercent, formatPrice, installments } from "@/lib/format";

type Props = {
  price: number;
  compareAt?: number;
  size?: "sm" | "lg";
  showInstallments?: boolean;
  className?: string;
};

export function Price({ price, compareAt, size = "sm", showInstallments = true, className }: Props) {
  const off = discountPercent(price, compareAt);
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        {off > 0 && (
          <span className={cn("text-navy/45 line-through", size === "lg" ? "text-base" : "text-[13px]")}>
            {formatPrice(compareAt!)}
          </span>
        )}
        <span className={cn("font-semibold text-navy", size === "lg" ? "text-[26px] tracking-tight" : "text-[15px]")}>
          {formatPrice(price)}
        </span>
        {off > 0 && size === "lg" && (
          <span className="rounded-[3px] bg-blush px-2 py-0.5 text-[11px] font-semibold text-rose-deep">-{off}%</span>
        )}
      </div>
      {showInstallments && (
        <span className={cn("text-navy-soft", size === "lg" ? "text-sm" : "text-[12px]")}>
          ou {installments(price).label}
        </span>
      )}
    </div>
  );
}
