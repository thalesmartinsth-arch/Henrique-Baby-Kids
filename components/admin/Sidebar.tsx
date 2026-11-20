"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BadgePercent,
  Boxes,
  ExternalLink,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Package,
  ReceiptText,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/format";
import { signOut } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/estoque", label: "Estoque", icon: Boxes },
  { href: "/admin/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/admin/cupons", label: "Cupons", icon: BadgePercent },
  { href: "/admin/colecoes", label: "Coleções", icon: Layers },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

export function Sidebar({ email, pendingOrders }: { email: string; pendingOrders: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Painel" className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          aria-current={active(href) ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-[4px] px-3 text-[14px] transition-colors",
            active(href) ? "bg-white/12 font-semibold text-white" : "text-white/70 hover:bg-white/8 hover:text-white",
          )}
        >
          <Icon className="size-[18px]" strokeWidth={1.6} />
          <span className="flex-1">{label}</span>
          {href === "/admin/pedidos" && pendingOrders > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose px-1.5 text-[11px] font-bold text-navy">{pendingOrders}</span>
          )}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-white/10 p-3">
      <Link href="/" target="_blank" className="flex min-h-11 items-center gap-3 rounded-[4px] px-3 text-[13px] text-white/70 hover:bg-white/8 hover:text-white">
        <ExternalLink className="size-4" /> Ver loja
      </Link>
      <form action={signOut}>
        <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-[4px] px-3 text-[13px] text-white/70 hover:bg-white/8 hover:text-white">
          <LogOut className="size-4" /> Sair
        </button>
      </form>
      <p className="truncate px-3 pt-2 text-[11px] text-white/45">{email}</p>
    </div>
  );

  const brand = (
    <div className="px-6 py-6">
      <p className="font-serif text-2xl italic text-white">Henrique</p>
      <p className="text-[9px] font-semibold uppercase tracking-[0.4em] text-rose">Painel da loja</p>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-navy lg:flex">
        {brand}
        {nav}
        {footer}
      </aside>

      <div className="sticky top-0 z-40 flex h-14 items-center justify-between bg-navy px-4 lg:hidden">
        <p className="font-serif text-xl italic text-white">Henrique · Painel</p>
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menu do painel" aria-expanded={open} className="grid size-11 place-items-center text-white">
          <Menu className="size-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy">
            <div className="flex items-center justify-between pr-3">
              {brand}
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu" className="grid size-11 place-items-center text-white">
                <X className="size-5" />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
