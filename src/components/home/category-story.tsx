"use client";

import Link from "next/link";
import { clsx } from "clsx";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";
import { SignalDot, Eyebrow } from "@/components/ui/signal";

export type SubcategoryLink = {
  name: string;
  href: string;
  count?: string;
};

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
  products: Product[];
  reverse?: boolean;
}) {
  const isDark = theme === "dark";

  return (
    <section
      aria-label={title}
      className={clsx(
        "relative overflow-hidden rounded-panel border p-6 sm:p-8 lg:p-10 transition-shadow duration-300",
        isDark
          ? "border-line bg-ink text-white shadow-[var(--shadow-lift)]"
          : "border-line bg-white text-ink",
      )}
    >
      {/* Editorial Category Visual + Story Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
        {/* Large Photographic Visual */}
        <div
          className={clsx(
            "group relative min-h-[300px] overflow-hidden rounded-surface bg-porcelain sm:min-h-[380px] lg:col-span-7",
            reverse && "lg:order-2",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1600ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
          />
          <div
            aria-hidden
            className={clsx(
              "absolute inset-0",
              isDark
                ? "bg-gradient-to-t from-black/80 via-transparent to-transparent"
                : "bg-gradient-to-t from-black/60 via-transparent to-transparent",
            )}
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/20 px-3 py-1 text-meta font-medium text-white backdrop-blur-md">
              <SignalDot tone="brand" live />
              Curated department edit
            </span>
          </div>
        </div>

        {/* Narrative & Navigation Pathways */}
        <div
          className={clsx(
            "flex flex-col justify-between lg:col-span-5",
            reverse && "lg:order-1",
          )}
        >
          <div>
            <Eyebrow index={kicker} className={isDark ? "text-brand" : undefined}>
              Department
            </Eyebrow>

            <h3
              className={clsx(
                "display mt-2 text-balance text-heading leading-[0.98] tracking-[-0.02em] sm:text-display-sm lg:text-display-md",
                isDark ? "text-white" : "text-ink",
              )}
            >
              {title}
            </h3>

            {subtitle && (
              <p
                className={clsx(
                  "mt-2 font-serif italic text-emphasis leading-snug",
                  isDark ? "text-white/80" : "text-ink-2",
                )}
              >
                {subtitle}
              </p>
            )}

            <p
              className={clsx(
                "mt-4 text-body leading-relaxed",
                isDark ? "text-white/75" : "text-ink-2",
              )}
            >
              {description}
            </p>

            {/* Subcategory Pathway Chips */}
            {subcategories && subcategories.length > 0 && (
              <div className="mt-6">
                <p
                  className={clsx(
                    "font-mono text-meta uppercase tracking-[0.14em]",
                    isDark ? "text-white/50" : "text-mute",
                  )}
                >
                  Featured Collections
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-support font-medium transition-all duration-200",
                        isDark
                          ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                          : "border-line bg-porcelain text-ink hover:border-brand hover:bg-white",
                      )}
                    >
                      <span>{sub.name}</span>
                      {sub.count && (
                        <span
                          className={clsx(
                            "text-meta",
                            isDark ? "text-white/50" : "text-mute",
                          )}
                        >
                          ({sub.count})
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA Action */}
          <div className="mt-8 border-t border-line/80 pt-6">
            <Link
              href={cta.href}
              className={clsx(
                "btn h-12 px-6 text-support font-semibold transition-transform hover:scale-[1.02]",
                isDark
                  ? "btn-primary shadow-[0_2px_12px_rgba(255,166,36,0.3)]"
                  : "btn-primary shadow-[0_2px_8px_rgb(var(--rgb-brand)/0.3)]",
              )}
            >
              <span>{cta.label}</span>
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Embedded Commerce Shelf: Real Products in This World */}
      {products.length > 0 && (
        <div className="mt-10 border-t border-line/80 pt-8">
          <div className="mb-5 flex items-baseline justify-between">
            <h4
              className={clsx(
                "text-emphasis font-semibold tracking-[-0.01em]",
                isDark ? "text-white" : "text-ink",
              )}
            >
              Featured in this category
            </h4>
            <Link
              href={cta.href}
              className={clsx(
                "text-support font-medium hover:underline",
                isDark ? "text-brand" : "text-brand-deep",
              )}
            >
              Shop all {products.length}+ items →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
