"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { ProductImage } from "@/components/product/product-image";
import { Price } from "@/components/ui/money";
import { priceInsight, savingsPct, deliveryLabel } from "@/lib/commerce";
import { useShop, useUI } from "@/lib/store";
import { QuickView } from "@/components/product/quick-view";
import { Icon } from "@/components/ui/icon";
import { Eyebrow, SignalDot } from "@/components/ui/signal";

export function FeaturePlusFour({
  title,
  subtitle,
  eyebrow = "TRENDING",
  featured,
  supporting,
  browseHref = "/search?sort=popular",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  featured: Product;
  supporting: Product[];
  browseHref?: string;
}) {
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const [quick, setQuick] = useState(false);

  const variant = featured.variants[0];
  const insight = priceInsight(featured);
  const off = savingsPct(featured);
  const delivery = deliveryLabel(featured);

  const handleAddToCart = () => {
    addToCart(featured.id, variant.id, 1);
    notify(`Added ${featured.name} to bag`);
  };

  return (
    <section aria-label={title} className="relative">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <Eyebrow index={eyebrow}>Curated Selection</Eyebrow>
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
          <span>View all trending</span>
          <Icon name="arrowRight" size={14} />
        </Link>
      </div>

      {/* Feature + 4 Composition Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Large Featured Hero Card (Left Column) */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-line bg-white p-5 shadow-[var(--shadow-hair)] transition-all duration-300 hover:shadow-[var(--shadow-soft)] sm:p-7 lg:col-span-5">
          <div>
            {/* Visual Header Pill */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-meta font-medium text-brand-deep">
                <SignalDot tone="brand" live />
                Featured Highlight
              </span>
              <button
                type="button"
                onClick={() => setQuick(true)}
                suppressHydrationWarning
                className="inline-flex items-center gap-1 text-meta font-medium text-mute hover:text-ink transition-colors"
              >
                <Icon name="sparkle" size={13} />
                <span>Quick look</span>
              </button>
            </div>

            {/* Large Product Lifestyle Image Container */}
            <Link
              href={`/p/${featured.slug}`}
              className="relative mt-5 block aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-porcelain sm:aspect-[4/3]"
            >
              <ProductImage
                product={featured}
                view="hero"
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="h-full w-full"
                imgClassName="object-contain p-4 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
              />
              {off > 0 && (
                <span className="absolute bottom-3 left-3 rounded-full bg-brand px-3 py-1 text-meta font-bold text-ink shadow-sm">
                  {off}% OFF
                </span>
              )}
            </Link>

            {/* Title & Brand */}
            <div className="mt-5">
              <p className="font-mono text-meta uppercase tracking-[0.14em] text-mute">
                {featured.brand}
              </p>
              <Link href={`/p/${featured.slug}`}>
                <h3 className="display mt-1 text-heading leading-tight tracking-[-0.01em] text-ink group-hover:text-brand-deep transition-colors sm:text-display-xs">
                  {featured.name}
                </h3>
              </Link>
              <p className="mt-2 text-support text-ink-2 line-clamp-2 leading-relaxed">
                {featured.summary}
              </p>
            </div>
          </div>

          {/* Pricing & Commerce Action Bar */}
          <div className="mt-6 border-t border-line/80 pt-5">
            <div className="flex items-baseline justify-between">
              <div>
                <Price
                  usd={featured.price}
                  strike={featured.compareAt}
                  size="lg"
                />
                <p className="mt-0.5 text-meta text-brand-deep font-medium">
                  {insight.label}
                </p>
                <p className="mt-0.5 text-meta text-emerald-700 font-medium flex items-center gap-1">
                  <Icon name="truck" size={12} />
                  <span>Arrives {delivery}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={featured.stock <= 0}
                suppressHydrationWarning
                className="btn btn-primary h-11 px-5 text-support font-semibold shadow-[0_2px_8px_rgb(var(--rgb-brand)/0.3)] transition-transform hover:scale-[1.02]"
              >
                <span>Add to bag</span>
                <Icon name="arrowRight" size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Supporting Products Grid (Right Column: 2x2) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-7">
          {supporting.slice(0, 4).map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-[20px] border border-line bg-white p-3.5 shadow-[var(--shadow-hair)] transition-all duration-300 hover:shadow-[var(--shadow-soft)] sm:p-4"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      {quick && (
        <QuickView
          product={featured}
          initialVariant={variant}
          onClose={() => setQuick(false)}
        />
      )}
    </section>
  );
}
