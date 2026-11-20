import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { photo, PHOTOS } from "@/lib/images";

export function EditorialBanner() {
  return (
    <section className="py-6 lg:py-10" aria-labelledby="editorial-title">
      <div className="wrap">
        <div className="group relative isolate grid min-h-[620px] overflow-hidden rounded-[var(--radius-card)] lg:min-h-[720px] lg:grid-cols-12">
          <Image
            src={photo(PHOTOS.editorialForest)}
            alt="Três crianças brincando juntas em uma clareira iluminada pelo sol"
            fill
            sizes="(min-width: 1440px) 1344px, 100vw"
            quality={80}
            className="-z-10 object-cover object-[50%_70%] transition-transform duration-[2000ms] ease-[var(--ease-soft)] group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent lg:bg-gradient-to-l lg:from-navy/75 lg:via-navy/20" />

          <div className="flex flex-col justify-end p-6 text-white sm:p-10 lg:col-span-6 lg:col-start-7 lg:justify-center lg:p-16">
            <p className="eyebrow !text-rose">Campanha de verão</p>
            <h2 id="editorial-title" className="display mt-5 text-[52px] sm:text-7xl lg:text-[84px]">
              Estilo que <em>cresce</em> com eles.
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-white/85">
              Peças especiais para acompanhar momentos inesquecíveis.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link href="/colecoes" className="btn btn-light group/btn">
                Descobrir coleção
                <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
              <p className="text-[12px] uppercase tracking-[0.2em] text-white/70">Linho · Algodão · Tricô</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
