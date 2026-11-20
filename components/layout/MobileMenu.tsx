"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, UserRound } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Logo } from "@/components/ui/Logo";
import { CATEGORIES } from "@/lib/catalog";
import { NAV, SITE } from "@/lib/site";
import { useUI } from "@/store/ui";

export function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onClose={close} side="left" label="Menu" title={<Logo className="items-start" />}>
      <nav aria-label="Menu mobile" className="px-5 py-6">
        <ul className="flex flex-col">
          {NAV.map((item) => (
            <li key={item.href} className="border-b border-line/70">
              <Link
                href={item.href}
                onClick={close}
                className="group flex min-h-14 items-center justify-between font-serif text-[26px] text-navy"
              >
                {item.label}
                <ArrowRight className="size-4 text-navy/40 transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>

        <p className="eyebrow mt-8 mb-4">Categorias</p>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/loja/${c.slug}`} onClick={close} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-mist">
                <Image src={c.image} alt="" fill sizes="120px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <span className="mt-1.5 block text-[12px] font-semibold">{c.name}</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2">
          <Link href="/conta" onClick={close} className="btn btn-outline px-3">
            <UserRound className="size-4" /> Conta
          </Link>
          <Link href="/favoritos" onClick={close} className="btn btn-outline px-3">
            <Heart className="size-4" /> Favoritos
          </Link>
        </div>
        <p className="mt-8 text-[12px] leading-relaxed text-navy-soft">
          {SITE.hours}
          <br />
          {SITE.email}
        </p>
      </nav>
    </Sheet>
  );
}
