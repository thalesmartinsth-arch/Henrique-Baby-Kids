import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  link?: { href: string; label: string };
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
};

export function SectionHeading({ eyebrow, title, description, link, align = "left", className, children }: Props) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-6 md:mb-14",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="display text-[40px] text-navy sm:text-5xl lg:text-[58px]">{title}</h2>
        {description && <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-navy-soft">{description}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="group inline-flex shrink-0 items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-navy"
        >
          <span className="link-underline">{link.label}</span>
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      )}
      {children}
    </div>
  );
}
