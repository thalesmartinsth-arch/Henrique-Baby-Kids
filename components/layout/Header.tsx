"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NAV, PROMO_MESSAGES } from "@/lib/site";
import { cn } from "@/lib/format";
import { useShop } from "@/store/shop";
import { useHydrated, useUI } from "@/store/ui";

function PromoBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % PROMO_MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="bg-navy text-white">
      <div className="wrap relative flex h-9 items-center justify-center overflow-hidden text-[11px] font-medium tracking-[0.16em] uppercase">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {PROMO_MESSAGES[i]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  href,
  children,
  badge,
  pulseKey,
  className,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
  badge?: number;
  pulseKey?: number;
  className?: string;
}) {
  const inner = (
    <>
      <motion.span
        key={pulseKey}
        initial={pulseKey ? { scale: 1.35, rotate: -8 } : false}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 12 }}
        className="inline-flex"
      >
        {children}
      </motion.span>
      <AnimatePresence>
        {!!badge && (
          <motion.span
            key={badge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose px-1 text-[10px] font-bold text-navy"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
  const cls = cn(
    "relative grid size-11 place-items-center rounded-full text-navy transition-colors duration-300 hover:bg-blush",
    className,
  );
  return href ? (
    <Link href={href} aria-label={label} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cartCount = useShop((s) => s.cart.reduce((n, i) => n + i.quantity, 0));
  const favCount = useShop((s) => s.favorites.length);
  const { setCartOpen, setSearchOpen, setMenuOpen, bagPulse } = useUI();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50">
      <PromoBar />
      <div
        className={cn(
          "border-b transition-all duration-500",
          scrolled ? "border-line bg-ivory/90 shadow-[0_8px_30px_-24px_rgba(38,59,85,0.5)] backdrop-blur-xl" : "border-transparent bg-ivory",
        )}
      >
        <div className={cn("wrap grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500", scrolled ? "h-16 lg:h-[68px]" : "h-[72px] lg:h-20")}>
          {/* Esquerda: menu mobile / busca desktop */}
          <div className="flex items-center gap-1">
            <IconButton label="Abrir menu" onClick={() => setMenuOpen(true)} className="lg:hidden">
              <Menu className="size-[22px]" strokeWidth={1.5} />
            </IconButton>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="group hidden h-11 w-full max-w-[260px] items-center gap-3 rounded-[var(--radius-btn)] border border-line bg-white/70 px-4 text-left text-[13px] text-navy/50 transition-all hover:border-navy/40 hover:bg-white lg:flex"
            >
              <Search className="size-4 text-navy transition-transform group-hover:scale-110" strokeWidth={1.6} />
              Buscar vestidos, conjuntos…
            </button>
            <IconButton label="Buscar" onClick={() => setSearchOpen(true)} className="lg:hidden">
              <Search className="size-5" strokeWidth={1.5} />
            </IconButton>
          </div>

          <Logo className={cn("origin-center transition-transform duration-500", scrolled && "scale-90")} />

          <div className="flex items-center justify-end gap-0.5 sm:gap-1">
            <IconButton label="Minha conta" href="/conta" className="hidden sm:grid">
              <UserRound className="size-5" strokeWidth={1.5} />
            </IconButton>
            <IconButton label={`Favoritos (${hydrated ? favCount : 0})`} href="/favoritos" badge={hydrated ? favCount : 0}>
              <Heart className="size-5" strokeWidth={1.5} />
            </IconButton>
            <IconButton
              label={`Abrir sacola (${hydrated ? cartCount : 0} itens)`}
              onClick={() => setCartOpen(true)}
              badge={hydrated ? cartCount : 0}
              pulseKey={bagPulse}
            >
              <ShoppingBag className="size-5" strokeWidth={1.5} />
            </IconButton>
          </div>
        </div>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className={cn("wrap flex items-center justify-center gap-10 transition-all duration-500", scrolled ? "h-11" : "h-12")}>
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "link-underline py-2 text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors",
                    isActive(item.href) ? "text-navy after:scale-x-100" : "text-navy/70 hover:text-navy",
                    item.label === "Promoções" && "text-rose-deep hover:text-rose-deep",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
