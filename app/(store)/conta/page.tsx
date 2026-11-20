"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Package, ShoppingBag } from "lucide-react";
import { photo, PHOTOS } from "@/lib/images";
import { cn } from "@/lib/format";
import { useUI } from "@/store/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const notify = useUI((s) => s.notify);

  return (
    <div className="wrap grid gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
      <div className="relative hidden min-h-[560px] overflow-hidden rounded-[var(--radius-card)] lg:block">
        <Image src={photo(PHOTOS.account)} alt="Menina sorrindo vestindo roupa verde" fill sizes="50vw" className="object-cover" />
      </div>
      <div className="flex flex-col justify-center lg:max-w-md">
        <p className="eyebrow">Minha conta</p>
        <h1 className="display mt-4 text-5xl sm:text-6xl">Que bom ver você</h1>
        <p className="mt-4 text-[15px] text-navy-soft">Entre com seu e-mail para acompanhar pedidos, salvar endereços e ver seus favoritos em qualquer aparelho.</p>
        <form
          noValidate
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (!EMAIL_RE.test(email.trim())) return setError("Digite um e-mail válido.");
            setError("");
            // Integração futura: enviar link mágico / código de acesso pelo backend.
            notify({ title: "Link de acesso enviado", description: `Confira a caixa de entrada de ${email}` });
          }}
        >
          <label htmlFor="login-email" className="mb-2 block text-[12px] font-semibold">E-mail</label>
          <input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} aria-describedby={error ? "login-error" : undefined} className={cn("field", error && "border-rose-deep")} placeholder="nome@email.com" />
          {error && <p id="login-error" className="mt-2 text-[12px] text-rose-deep">{error}</p>}
          <button type="submit" className="btn btn-primary mt-4 w-full">Receber link de acesso</button>
        </form>
        <ul className="mt-10 grid grid-cols-3 gap-2 text-center text-[12px]">
          {[
            { icon: Package, label: "Pedidos", href: "/conta" },
            { icon: Heart, label: "Favoritos", href: "/favoritos" },
            { icon: ShoppingBag, label: "Sacola", href: "/sacola" },
          ].map(({ icon: Icon, label, href }) => (
            <li key={label}>
              <Link href={href} className="flex flex-col items-center gap-2 rounded-[3px] bg-white p-4 transition-all hover:-translate-y-0.5 hover:bg-blush">
                <Icon className="size-5 text-sky-deep" strokeWidth={1.4} />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
