import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCarousel } from "@/components/product/ProductCarousel";
import { getNewArrivals } from "@/lib/catalog";

export function NewArrivals() {
  const products = getNewArrivals();
  return (
    <section className="overflow-hidden py-20 lg:py-28" aria-labelledby="new-title">
      <div className="wrap">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky/50 bg-sky-soft px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-sky-deep">
              <span className="size-1.5 rounded-full bg-rose-deep" />
              New Collection
            </span>
            <h2 id="new-title" className="display mt-5 text-[40px] sm:text-5xl lg:text-[58px]">
              Acabou de <em className="text-sky-deep">chegar</em>
            </h2>
            <p className="mt-4 max-w-md text-[15px] text-navy-soft">
              {products.length} lançamentos da estação, em tiragens pequenas.
            </p>
          </div>
          <Link href="/loja/novidades" className="group inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em]">
            <span className="link-underline">Ver lançamentos</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <ProductCarousel products={products} label="Lançamentos" />
      </div>
    </section>
  );
}
