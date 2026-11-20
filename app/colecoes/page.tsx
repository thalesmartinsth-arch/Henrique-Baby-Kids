import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/shop/PageHero";
import { COLLECTIONS, PRODUCTS } from "@/lib/catalog";
import { cn } from "@/lib/format";

export const metadata: Metadata = {
  title: "Coleções",
  description: "Jardim de Verão, Pequenos Clássicos e Primeiros Dias — as coleções da Henrique Baby & Kids.",
};

export default function CollectionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Coleções"
        title="Histórias para vestir"
        description="Cada coleção nasce de uma estação e de um jeito de brincar. Peças que combinam entre si e com o que já está no armário."
        crumbs={[{ label: "Início", href: "/" }, { label: "Coleções" }]}
      />
      <div className="wrap space-y-6 pb-24 lg:space-y-10">
        {COLLECTIONS.map((c, i) => {
          const items = PRODUCTS.filter((p) => p.collection === c.slug);
          return (
            <section
              key={c.slug}
              id={c.slug}
              className="grid scroll-mt-48 overflow-hidden rounded-[var(--radius-card)] bg-white lg:grid-cols-2"
              aria-labelledby={`${c.slug}-title`}
            >
              <Link href={`/loja?colecao=${c.slug}`} className={cn("group relative block min-h-[420px] overflow-hidden lg:min-h-[600px]", i % 2 === 1 && "lg:order-2")}>
                <Image src={c.image} alt={`Campanha da coleção ${c.name}`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-soft)] group-hover:scale-[1.03]" />
              </Link>
              <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
                <p className="eyebrow">Coleção 0{i + 1} · {items.length} peças</p>
                <h2 id={`${c.slug}-title`} className="display mt-4 text-5xl lg:text-6xl">{c.name}</h2>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-navy-soft">{c.description}</p>
                <ul className="mt-8 flex gap-2">
                  {items.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <Link href={`/produto/${p.slug}`} className="group block" aria-label={p.name}>
                        <div className="relative h-24 w-[72px] overflow-hidden rounded-[3px] bg-mist sm:h-28 sm:w-20">
                          <Image src={p.images[0].src} alt="" fill sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/loja?colecao=${c.slug}`} className="btn btn-primary group mt-10 w-fit">
                  Ver a coleção
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
