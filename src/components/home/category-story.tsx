"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { Product } from "@/lib/types";
import { CardRail } from "@/components/home/card-rail";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";

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
  heroImage,
  theme = "warm",
  cta,
  products,
  reverse = false,
}: {
  kicker?: string;
  title: string;
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
          </div>

          <div
            className={clsx(
              "flex min-h-0 flex-col justify-center gap-8 lg:col-span-5 lg:py-2",
              reverse && "lg:order-1",
            )}
          >
            <div>
              <h3
                className={clsx(
                  "display mt-4 text-balance text-display-sm leading-[0.98] tracking-[-0.02em] lg:text-display-md",
                  isDark ? "text-white" : "text-ink",
                )}
              >
                {title}
              </h3>
            </div>

            <div>
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
        <section aria-label={`Featured in ${kicker.toLowerCase()}`} className="fold rounded-panel border border-line bg-white p-6 text-ink sm:p-8 lg:p-10">
          <div className="mb-8 flex lg:mb-4 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h4 className="display text-heading capitalize tracking-[-0.02em] text-ink lg:text-display-sm">
                {kicker.toLowerCase()}
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href={cta.href} className="link-underline text-support font-medium text-brand-deep">
                View all →
              </Link>
            </div>
          </div>

          <div className="fold-body lg:flex lg:items-center">
            <CardRail label={`${kicker.toLowerCase()} products`}>
              {shelf.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </CardRail>
          </div>
        </section>
      )}
    </div>
  );
}
