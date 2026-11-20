"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { useEscape, useLockBody } from "@/lib/hooks";

type Props = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  side?: "left" | "right" | "top" | "center";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  label: string;
};

const variants = {
  right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
  left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
  top: { initial: { y: "-100%" }, animate: { y: 0 }, exit: { y: "-100%" } },
  center: { initial: { opacity: 0, y: 24, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 16, scale: 0.98 } },
};

/** Painel lateral/modal acessível com foco preso, Esc e bloqueio de scroll. */
export function Sheet({ open, onClose, title, side = "right", children, footer, className, label }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  useLockBody(open);
  useEscape(onClose, open);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const el =
        panel.current?.querySelector<HTMLElement>("[data-autofocus]") ??
        panel.current?.querySelector<HTMLElement>("button, input");
      el?.focus();
    }, 60);
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panel.current) return;
      const els = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]',
      );
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", trap);
      previous?.focus?.();
    };
  }, [open]);

  const v = variants[side];
  const position = {
    right: "inset-y-0 right-0 h-dvh w-full max-w-[440px]",
    left: "inset-y-0 left-0 h-dvh w-full max-w-[400px]",
    top: "inset-x-0 top-0 max-h-dvh w-full",
    center: "left-1/2 top-1/2 max-h-[88dvh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)]",
  }[side];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-navy/35 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden
          />
          <div className={cn("pointer-events-none absolute", position)}>
            <motion.div
              ref={panel}
              role="dialog"
              aria-modal="true"
              aria-label={label}
              {...v}
              transition={{ type: "tween", ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
              className={cn(
                "pointer-events-auto flex h-full max-h-[inherit] flex-col overflow-hidden bg-ivory shadow-[0_0_60px_-20px_rgba(38,59,85,0.45)]",
                side === "center" && "rounded-[var(--radius-card)]",
                className,
              )}
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
                <div className="font-serif text-2xl font-medium">{title}</div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="grid size-11 place-items-center rounded-full text-navy transition-all hover:rotate-90 hover:bg-blush"
                >
                  <X className="size-5" strokeWidth={1.6} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
              {footer && <div className="border-t border-line bg-white">{footer}</div>}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
