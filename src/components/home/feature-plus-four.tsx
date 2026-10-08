"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { CardRail } from "@/components/home/card-rail";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";

/**
 * Trending shelf — heading above six ranked products, three across in two rows, spanning the section.
 */
export function FeaturePlusFour({
  title,
  products,
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
    <section aria-label={title} className="fold lg:py-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end lg:mb-4">
        <div>
          <h2 className="display text-balance text-display-sm text-ink lg:text-display-md">{title}</h2>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <Link
            href={browseHref}
            className="link-underline flex items-center gap-1.5 text-support font-medium text-brand-deep"
          >
            <span>View all trending</span>
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>

      <div className="fold-body lg:flex lg:items-center">
        <CardRail label="Trending products">
          {products.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} />
          ))}
        </CardRail>
      </div>
    </section>
  );
}
