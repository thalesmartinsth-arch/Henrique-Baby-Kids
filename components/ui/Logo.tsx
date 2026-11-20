import Link from "next/link";
import { cn } from "@/lib/format";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Henrique Baby & Kids — página inicial"
      className={cn("group inline-flex flex-col items-center leading-none", className)}
    >
      <span
        className={cn(
          "font-serif text-[28px] font-medium italic tracking-[-0.01em] transition-colors sm:text-[32px]",
          light ? "text-white" : "text-navy",
        )}
      >
        Henrique
      </span>
      <span className="mt-1 flex items-center gap-2">
        <span className={cn("h-px w-4 transition-all duration-500 group-hover:w-6", light ? "bg-rose" : "bg-rose")} />
        <span
          className={cn(
            "text-[9px] font-semibold uppercase tracking-[0.42em]",
            light ? "text-white/80" : "text-sky-deep",
          )}
        >
          Baby &amp; Kids
        </span>
        <span className="h-px w-4 bg-sky transition-all duration-500 group-hover:w-6" />
      </span>
    </Link>
  );
}
