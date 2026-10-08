"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";

type FeatureItem = {
  product: Product;
  highlightSpec: string;
  badge: string;
};

/**
 * Premium showcase — a centred editorial heading over three flagships at the card's featured density.
 * On laptops the cards size from the fold height, so heading, photographs and prices share one screen.
 */
export function ThreeCardFeature({
  title = "Design Icons & Flagships",
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
    <section aria-label={title} className="fold lg:py-6">
      <div className="mb-6 flex flex-col gap-3 lg:mb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="display text-balance text-display-sm text-ink lg:text-display-md">{title}</h2>
        </div>
        <div className="lg:max-w-md lg:text-right">
          <Link
            href={browseHref}
            className="link-underline mt-2 inline-flex items-center gap-1.5 text-support font-medium text-brand-deep"
          >
            <span>View all flagships</span>
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>
      </div>

      <div className="fold-body lg:flex lg:justify-center">
        <div className="fold-grid [--gap-x:1.5rem] max-sm:!grid-cols-1">
          {items.slice(0, 3).map(({ product }) => (
            <ProductCard key={product.id} product={product} layout="featured" />
          ))}
        </div>
      </div>
    </section>
  );
}
