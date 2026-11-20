"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/format";

export function Toaster() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[80] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[var(--radius-card)] border bg-white p-3 pr-2 shadow-[0_20px_50px_-20px_rgba(38,59,85,0.45)]",
              t.tone === "error" ? "border-rose" : "border-line",
            )}
          >
            {t.image ? (
              <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-[3px] bg-mist">
                <Image src={t.image} alt="" fill sizes="44px" className="object-cover" />
              </div>
            ) : (
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", t.tone === "error" ? "bg-blush text-rose-deep" : "bg-sky-soft text-sky-deep")}>
                {t.tone === "error" ? <X className="size-4" /> : <Check className="size-4" />}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-navy">{t.title}</p>
              {t.description && <p className="truncate text-[12px] text-navy-soft">{t.description}</p>}
            </div>
            <button
              type="button"
              aria-label="Fechar aviso"
              onClick={() => dismiss(t.id)}
              className="grid size-9 shrink-0 place-items-center rounded-full text-navy/50 transition-colors hover:bg-mist hover:text-navy"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
