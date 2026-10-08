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

/**
 * Premium showcase — a centred editorial heading over three flagships at the card's featured density.
 * On laptops the cards size from the fold height, so heading, photographs and prices share one screen.
 */
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
    <section aria-label={title} className="fold lg:py-6">
      <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center text-center lg:mb-7">
        <Eyebrow index={eyebrow}>Signature Pieces</Eyebrow>
        <h2 className="display mt-3 text-balance text-display-sm text-ink lg:text-display-md">{title}</h2>
        {subtitle && <p className="mt-3 max-w-xl text-body leading-relaxed text-ink-2">{subtitle}</p>}
        <Link
          href={browseHref}
          className="link-underline mt-4 inline-flex items-center gap-1.5 text-support font-medium text-brand-deep"
        >
          <span>View all flagships</span>
          <Icon name="arrowRight" size={14} />
        </Link>
      </div>

      <div className="fold-body lg:flex lg:justify-center">
        <div className="fold-grid [--card-text:11.75rem] [--gap-x:1.5rem] max-sm:!grid-cols-1">
          {items.slice(0, 3).map(({ product, highlightSpec, badge }) => (
            <ProductCard key={product.id} product={product} layout="featured" label={badge} note={highlightSpec} />
          ))}
        </div>
      </div>
    </section>
  );
}
