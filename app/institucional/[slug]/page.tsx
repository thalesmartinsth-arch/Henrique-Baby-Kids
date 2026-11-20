import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/shop/PageHero";
import { SizeChartTable } from "@/components/product/SizeGuide";
import { INFO_PAGES } from "@/lib/site";
import { cn } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return INFO_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = INFO_PAGES.find((p) => p.slug === slug);
  return page ? { title: page.title, description: page.intro } : {};
}

export default async function InfoPage({ params }: Params) {
  const { slug } = await params;
  const page = INFO_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();

  return (
    <>
      <PageHero eyebrow="Institucional" title={page.title} crumbs={[{ label: "Início", href: "/" }, { label: page.title }]} />
      <div className="wrap grid gap-12 pb-24 lg:grid-cols-[240px_1fr] lg:gap-20">
        <nav aria-label="Páginas institucionais" className="order-2 lg:order-1">
          <ul className="space-y-1 lg:sticky lg:top-[190px]">
            {INFO_PAGES.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/institucional/${p.slug}`}
                  className={cn("flex min-h-10 items-center text-[14px] transition-colors", p.slug === slug ? "font-semibold text-navy" : "text-navy-soft hover:text-navy")}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="order-1 max-w-2xl lg:order-2">
          <p className="font-serif text-2xl leading-snug sm:text-3xl">{page.intro}</p>
          {page.sections.map((s) => (
            <section key={s.heading} className="mt-10">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.2em] text-sky-deep">{s.heading}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-navy-soft">{s.body}</p>
            </section>
          ))}
          {slug === "guia-de-medidas" && (
            <div className="mt-10 space-y-12">
              <section>
                <h2 className="mb-4 font-serif text-3xl">Bebês</h2>
                <SizeChartTable group="baby" />
              </section>
              <section>
                <h2 className="mb-4 font-serif text-3xl">Infantil</h2>
                <SizeChartTable group="kids" />
              </section>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
