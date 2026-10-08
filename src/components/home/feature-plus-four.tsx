"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/signal";

/**
 * Trending shelf — heading above six ranked products, three across in two rows, spanning the section.
 */
export function FeaturePlusFour({
  title,
  subtitle,
  eyebrow = "TRENDING",
  products,
  note,
  browseHref = "/search?sort=popular",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  products: Product[];
  /** How the ranking was produced, shown beside the link */
  note?: string;
  browseHref?: string;
}) {
  return (
    <section aria-label={title}>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Eyebrow index={eyebrow}>Curated Selection</Eyebrow>
          <h2 className="display mt-3 text-balance text-display-sm text-ink lg:text-display-md">{title}</h2>
          {subtitle && <p className="mt-3 max-w-xl text-body leading-relaxed text-ink-2">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          {note && (
            <p className="flex items-center gap-2 font-mono text-meta uppercase tracking-[0.12em] text-mute">
              <Icon name="trend" size={14} />
              {note}
            </p>
          )}
          <Link
            href={browseHref}
            className="link-underline flex items-center gap-1.5 text-support font-medium text-brand-deep"
          >
            <span>View all trending</span>
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:gap-x-6 lg:gap-y-10">
        {products.slice(0, 6).map((p, i) => (
          <ProductCard key={p.id} product={p} rank={i + 1} priority={i < 3} />
        ))}
      </div>
    </section>
  );
}
