import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CATEGORIES } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/format";

// Grade editorial: os dois primeiros cards ocupam mais espaço no desktop.
const LAYOUT = [
  "lg:col-span-5 lg:row-span-2",
  "lg:col-span-4 lg:row-span-2",
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-6",
  "lg:col-span-6",
];

export function Categories({ products }: { products: Product[] }) {
  return (
    <section className="py-20 lg:py-28">
      <div className="wrap">
        <SectionHeading
          eyebrow="Categorias"
          title={
            <>
              Encontre o look <em className="text-sky-deep">ideal</em>
            </>
          }
          link={{ href: "/loja", label: "Ver toda a loja" }}
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[260px] lg:grid-cols-12 lg:gap-5">
          {CATEGORIES.map((c, i) => {
            const count = products.filter((p) => p.categories.includes(c.slug)).length;
            return (
              <Link
                key={c.slug}
                href={`/loja/${c.slug}`}
                className={cn(
                  "group relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-mist p-4 transition-transform duration-500 hover:-translate-y-0.5 sm:min-h-[340px] sm:p-6 lg:min-h-0",
                  LAYOUT[i],
                )}
              >
                <Image
                  src={c.image}
                  alt={`Criança vestindo peças da categoria ${c.name}`}
                  fill
                  sizes="(min-width: 1024px) 40vw, 50vw"
                  className="-z-10 object-cover transition-transform duration-[1400ms] ease-[var(--ease-soft)] group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent" />
                <div className="flex items-end justify-between gap-3 text-white">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75">{count} peças</p>
                    <h3 className="display mt-1 text-[30px] sm:text-[40px]">{c.name}</h3>
                    <p className="mt-1 hidden text-[13px] text-white/80 sm:block">{c.tagline}</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/50 backdrop-blur-sm transition-all duration-500 group-hover:rotate-45 group-hover:border-white group-hover:bg-white group-hover:text-navy">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
