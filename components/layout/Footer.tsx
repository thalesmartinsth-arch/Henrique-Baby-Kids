import Link from "next/link";
import { Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { SITE } from "@/lib/site";

const COLUMNS = [
  {
    title: "Comprar",
    links: [
      { label: "Meninas", href: "/loja/meninas" },
      { label: "Meninos", href: "/loja/meninos" },
      { label: "Bebês", href: "/loja/bebes" },
      { label: "Novidades", href: "/loja/novidades" },
      { label: "Promoções", href: "/loja/promocoes" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "Nossa história", href: "/institucional/sobre" },
      { label: "Coleções", href: "/colecoes" },
      { label: "Guia de medidas", href: "/institucional/guia-de-medidas" },
      { label: "Política de privacidade", href: "/institucional/privacidade" },
    ],
  },
  {
    title: "Atendimento",
    links: [
      { label: "Fale conosco", href: "/institucional/atendimento" },
      { label: "Trocas e devoluções", href: "/institucional/trocas-e-devolucoes" },
      { label: "Entrega e frete", href: "/institucional/entrega" },
      { label: "Minha conta", href: "/conta" },
    ],
  },
];

const PAYMENTS = ["Pix", "Visa", "Mastercard", "Elo", "Amex", "Boleto"];
const SOCIAL = [
  { label: "Instagram", href: SITE.instagramUrl },
  { label: "Pinterest", href: "https://www.pinterest.com/" },
  { label: "Facebook", href: "https://www.facebook.com/" },
];

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="wrap grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)] lg:py-20">
        <div className="max-w-sm">
          <Logo light className="items-start" />
          <p className="mt-6 text-[14px] leading-relaxed text-white/70">
            Boutique de moda infantil com algodão, linho e tricô em cortes confortáveis — do recém-nascido aos 12 anos.
          </p>
          <ul className="mt-8 space-y-3 text-[13px] text-white/75">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.6} />
              {SITE.email}
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.6} />
              {SITE.hours}
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-rose" strokeWidth={1.6} />
              Loja online · envio de {SITE.city}
            </li>
          </ul>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky">{col.title}</h2>
            <ul className="mt-5 space-y-1">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline inline-flex min-h-10 items-center text-[14px] text-white/80 hover:text-white sm:min-h-9">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-8 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">Formas de pagamento</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {PAYMENTS.map((p) => (
                <li key={p} className="rounded-[3px] border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-white/85">
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">Redes sociais</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {SOCIAL.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-10 items-center gap-1.5 rounded-[3px] border border-white/15 px-4 text-[13px] text-white/85 transition-all hover:-translate-y-px hover:border-rose hover:text-white"
                  >
                    {s.label}
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-2 py-6 text-[12px] text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. Loja de demonstração — produtos e preços fictícios.</p>
          <p>Fotos de demonstração: Unsplash.</p>
        </div>
      </div>
    </footer>
  );
}
