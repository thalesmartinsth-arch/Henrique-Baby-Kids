import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Você está em" className="text-[12px] text-navy-soft">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((c, i) => (
          <li key={c.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="size-3 text-navy/30" />}
            {c.href ? (
              <Link href={c.href} className="link-underline hover:text-navy">
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-navy">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  crumbs: Crumb[];
}) {
  if (!image) {
    return (
      <section className="wrap pb-10 pt-8 lg:pb-14 lg:pt-12">
        <Breadcrumbs items={crumbs} />
        {eyebrow && <p className="eyebrow mt-8">{eyebrow}</p>}
        <h1 className="display mt-3 text-5xl sm:text-6xl lg:text-7xl">{title}</h1>
        {description && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-navy-soft">{description}</p>}
      </section>
    );
  }
  return (
    <section className="wrap pb-10 pt-6 lg:pb-14 lg:pt-8">
      <Breadcrumbs items={crumbs} />
      <div className="relative isolate mt-6 flex min-h-[300px] items-end overflow-hidden rounded-[var(--radius-card)] p-6 sm:min-h-[360px] sm:p-10 lg:min-h-[420px] lg:p-14">
        <Image src={image} alt="" fill priority sizes="(min-width: 1440px) 1344px, 100vw" className="-z-10 object-cover object-[50%_30%]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy/75 via-navy/25 to-transparent lg:bg-gradient-to-r lg:from-navy/70 lg:via-navy/20" />
        <div className="max-w-xl text-white">
          {eyebrow && <p className="eyebrow !text-rose">{eyebrow}</p>}
          <h1 className="display mt-3 text-5xl sm:text-6xl lg:text-[80px]">{title}</h1>
          {description && <p className="mt-4 text-[15px] leading-relaxed text-white/85">{description}</p>}
        </div>
      </div>
    </section>
  );
}
