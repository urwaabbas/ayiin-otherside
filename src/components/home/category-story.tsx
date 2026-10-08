"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/signal";

export type SubcategoryLink = {
  name: string;
  href: string;
  count?: string;
};

/**
 * Department story in two parts:
 * 1. the story (one laptop fold) — full-height photograph beside the heading, copy and CTA;
 * 2. the shelf — "Featured in this category": heading and collection links above
 *    six products, three across in two rows, spanning the panel.
 */
export function CategoryStory({
  kicker = "DEPARTMENT STORY",
  title,
  subtitle,
  description,
  heroImage,
  theme = "warm",
  subcategories,
  cta,
  products,
  reverse = false,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  description: string;
  heroImage: string;
  theme?: "warm" | "dark" | "stone";
  subcategories?: SubcategoryLink[];
  cta: {
    label: string;
    href: string;
  };
  /** Exactly six fill the shelf */
  products: Product[];
  reverse?: boolean;
}) {
  const isDark = theme === "dark";
  const panel = "fold relative overflow-hidden rounded-panel border p-6 sm:p-8 lg:p-10";
  const shelf = products.slice(0, 6);

  return (
    <div className="space-y-[var(--fold-gap)]">
      {/* ── Fold 1 · Story ── */}
      <section aria-label={title} className={clsx(panel, isDark ? "border-ink bg-ink text-white" : "border-line bg-white text-ink")}>
        <div className="fold-body grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-12">
          <div
            className={clsx(
              "group relative min-h-[300px] overflow-hidden rounded-surface bg-porcelain sm:min-h-[380px] lg:col-span-7 lg:min-h-0",
              reverse && "lg:order-2",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-meta font-medium text-white backdrop-blur-md">
              Curated department edit
            </span>
          </div>

          <div
            className={clsx(
              "flex min-h-0 flex-col justify-between gap-8 lg:col-span-5 lg:py-2",
              reverse && "lg:order-1",
            )}
          >
            <div>
              <Eyebrow index={kicker} tone={isDark ? "dark" : undefined}>
                Department
              </Eyebrow>
              <h3
                className={clsx(
                  "display mt-4 text-balance text-display-sm leading-[0.98] tracking-[-0.02em] lg:text-display-md",
                  isDark ? "text-white" : "text-ink",
                )}
              >
                {title}
              </h3>
              {subtitle && (
                <p className={clsx("mt-4 font-serif text-emphasis italic leading-snug", isDark ? "text-white/80" : "text-ink-2")}>
                  {subtitle}
                </p>
              )}
              <p className={clsx("mt-4 max-w-md text-body leading-relaxed", isDark ? "text-white/70" : "text-ink-2")}>
                {description}
              </p>
            </div>

            <div className={clsx("border-t pt-6", isDark ? "border-white/15" : "border-line")}>
              <Link href={cta.href} className="btn btn-primary h-12 px-6 text-support font-semibold">
                <span>{cta.label}</span>
                <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured in this category: heading above six products, three across in two rows ── */}
      {shelf.length > 0 && (
        <section aria-label={`Featured in ${kicker.toLowerCase()}`} className="rounded-panel border border-line bg-white p-6 text-ink sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow index={kicker}>Featured</Eyebrow>
              <h4 className="display mt-3 text-heading tracking-[-0.02em] text-ink lg:text-display-sm">
                Featured in this category
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {subcategories?.map((sub) => (
                <Link
                  key={sub.name}
                  href={sub.href}
                  className="link-underline text-support text-ink-2 transition-colors hover:text-ink"
                >
                  {sub.name}
                </Link>
              ))}
              <Link href={cta.href} className="link-underline text-support font-medium text-brand-deep">
                Shop the full department →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
            {shelf.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
