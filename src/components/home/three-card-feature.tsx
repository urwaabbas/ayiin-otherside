"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/ui/money";
import { useShop, useUI } from "@/lib/store";
import { QuickView } from "@/components/product/quick-view";
import { Icon } from "@/components/ui/icon";
import { Eyebrow, SignalDot } from "@/components/ui/signal";

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
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const [quickProduct, setQuickProduct] = useState<Product | null>(null);

  const handleAdd = (product: Product) => {
    addToCart(product.id, product.variants[0].id, 1);
    notify(`Added ${product.name} to bag`);
  };

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

      {/* 3-Card Premium Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
        {items.slice(0, 3).map(({ product, highlightSpec, badge }) => (
          <div
            key={product.id}
            className="group flex flex-col justify-between rounded-[24px] border border-line bg-white p-5 shadow-[var(--shadow-hair)] transition-all duration-300 hover:shadow-[var(--shadow-lift)] sm:p-6"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-porcelain px-3 py-1 text-meta font-medium text-ink">
                  <SignalDot tone="brand" live />
                  {badge}
                </span>
                <button
                  type="button"
                  onClick={() => setQuickProduct(product)}
                  suppressHydrationWarning
                  className="inline-flex items-center gap-1 text-meta font-medium text-mute hover:text-ink transition-colors"
                >
                  <Icon name="sparkle" size={13} />
                  <span>Quick look</span>
                </button>
              </div>

              {/* Large Portrait Image */}
              <Link
                href={`/p/${product.slug}`}
                className="relative mt-4 block aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-porcelain"
              >
                <ProductImage
                  product={product}
                  view="hero"
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                  className="h-full w-full"
                  imgClassName="object-contain p-4 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
                />
              </Link>

              {/* Details */}
              <div className="mt-5">
                <p className="font-mono text-meta uppercase tracking-[0.14em] text-mute">
                  {product.brand}
                </p>
                <Link href={`/p/${product.slug}`}>
                  <h3 className="display mt-1 text-heading leading-tight tracking-[-0.01em] text-ink group-hover:text-brand-deep transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-1.5 text-support text-ink-2 line-clamp-2 leading-relaxed">
                  {product.summary}
                </p>

                {/* Spec Highlight Pill */}
                <div className="mt-3.5 rounded-lg border border-line/70 bg-porcelain/60 px-3 py-2 text-meta text-ink-2 font-mono">
                  <span className="text-ink font-medium">Spec: </span>
                  {highlightSpec}
                </div>
              </div>
            </div>

            {/* Price & Action */}
            <div className="mt-6 border-t border-line/80 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <Price
                    usd={product.price}
                    strike={product.compareAt}
                    size="md"
                  />
                  <p className="mt-0.5 text-meta text-mute">Verified pricing</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  suppressHydrationWarning
                  className="btn btn-secondary h-11 px-4 text-support font-semibold hover:border-brand hover:text-brand-deep transition-all"
                >
                  <span>Add to bag</span>
                  <Icon name="arrowRight" size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {quickProduct && (
        <QuickView
          product={quickProduct}
          initialVariant={quickProduct.variants[0]}
          onClose={() => setQuickProduct(null)}
        />
      )}
    </section>
  );
}
