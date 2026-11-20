import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { photo, PHOTOS } from "@/lib/images";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/format";

const ALTS = [
  "Menina com blusa de poá e short jeans",
  "Detalhe de sapatos infantis decorados",
  "Roupinhas de bebê penduradas em cabides",
  "Menina sorrindo com vestido estampado",
  "Par de sapatinhos azuis sobre manta",
  "Crianças abraçadas ao ar livre",
  "Menina brincando no balanço",
  "Roupas infantis em tons de amarelo",
];

export function InstagramGrid() {
  return (
    <section className="py-20 lg:py-28" aria-labelledby="insta-title">
      <div className="wrap">
        <SectionHeading
          align="center"
          eyebrow={SITE.instagram}
          title={
            <span id="insta-title">
              Um universo de <em className="text-sky-deep">pequenos estilos.</em>
            </span>
          }
        />
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
          {PHOTOS.insta.map((id, i) => (
            <a
              key={id}
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Ver no Instagram: ${ALTS[i]}`}
              className={cn(
                "group relative block aspect-square overflow-hidden rounded-[var(--radius-card)] bg-mist",
                (i === 0 || i === 5) && "md:row-span-2 md:aspect-auto",
              )}
            >
              <Image
                src={photo(id)}
                alt={ALTS[i]}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-soft)] group-hover:scale-[1.04]"
              />
              <span className="absolute inset-0 grid place-items-center bg-navy/0 transition-colors duration-500 group-hover:bg-navy/30">
                <span className="grid size-12 scale-75 place-items-center rounded-full bg-white text-navy opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                  <ArrowUpRight className="size-5" />
                </span>
              </span>
            </a>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline group">
            Acompanhe no Instagram
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
