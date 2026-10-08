"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/signal";

type FeatureItem = {
  product: Product;
  highlightSpec: string;
  badge: string;
};

export function ThreeCardFeature({
  title = "Design Icons & Flagships",
  subtitle = "High-performing architectural tools and enduring furniture engineered to last decades.",
  eyebrow = "PREMIUM SHOWCASE",
  items,
  browseHref = "/search?sort=price-desc",
}: {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  items: FeatureItem[];
  browseHref?: string;
}) {
  return (
    <section aria-label={title} className="relative">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <Eyebrow index={eyebrow}>Signature Pieces</Eyebrow>
          <h2 className="display mt-1 text-display-xs leading-tight tracking-[-0.02em] sm:text-display-sm lg:text-display-md text-ink">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-body text-ink-2 max-w-xl">{subtitle}</p>
          )}
        </div>

        <Link
          href={browseHref}
          className="link-underline flex items-center gap-1.5 text-support font-medium text-brand-deep shrink-0 self-start sm:self-auto"
        >
          <span>View all flagships</span>
          <Icon name="arrowRight" size={14} />
        </Link>
      </div>

      {/* Three flagships — the product card at its featured density */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3">
        {items.slice(0, 3).map(({ product, highlightSpec, badge }) => (
          <ProductCard key={product.id} product={product} layout="featured" label={badge} note={highlightSpec} />
        ))}
      </div>
    </section>
  );
}
