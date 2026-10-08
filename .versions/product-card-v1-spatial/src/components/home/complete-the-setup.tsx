"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { productBySlug } from "@/lib/catalog/products";
import { ProductImage } from "@/components/product/product-image";
import { ProductCard } from "@/components/product/product-card";
import { Rating } from "@/components/product/rating";
import { Price } from "@/components/ui/money";
import { Eyebrow, SignalDot } from "@/components/ui/signal";
import { Icon } from "@/components/ui/icon";
import { WORKSPACE_SETUP } from "@/lib/campaigns";
import { deliveryLabel } from "@/lib/commerce";
import { useShop, useUI } from "@/lib/store";

export function CompleteTheSetup() {
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);

  const anchor = productBySlug(WORKSPACE_SETUP.anchorSlug);
  const complementary = WORKSPACE_SETUP.complementarySlugs
    .map(productBySlug)
    .filter((p): p is Product => Boolean(p));

  if (!anchor) return null;

  const handleAddProduct = (p: Product) => {
    addToCart(p.id, p.variants[0].id, 1, false);
    notify("Added to cart", `${p.name} · Arrives ${deliveryLabel(p)}`, {
      label: "View cart",
      href: "/cart",
    });
  };

  return (
    <section
      aria-label="Complete the setup"
      className="rounded-panel border border-line bg-white p-6 sm:p-8 lg:p-10"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow index="SETUP">Merchandising</Eyebrow>
          <h2 className="display mt-2 text-heading tracking-[-0.02em] sm:text-display-sm">
            {WORKSPACE_SETUP.title}
          </h2>
          <p className="mt-1 text-body text-mute">
            {WORKSPACE_SETUP.subtitle}
          </p>
        </div>
        <Link
          href="/c/office"
          className="link-underline inline-flex items-center gap-1.5 text-support font-medium text-brand-deep self-start sm:self-auto"
        >
          <span>Explore all workspace essentials</span>
          <Icon name="arrowRight" size={15} />
        </Link>
      </div>

      {/* Grid: Anchor Feature on Left, 4 Complementary on Right */}
      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Anchor Product Spotlight */}
        <div className="flex flex-col overflow-hidden rounded-surface border border-line bg-white p-3 sm:p-4 lg:col-span-5">
          <div className="flex items-center justify-between px-1 pt-1 sm:px-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-meta font-medium text-ink shadow-[var(--shadow-hair)]">
              <SignalDot tone="brand" live /> Anchor piece
            </span>
            <span className="text-meta text-mute">{anchor.brand}</span>
          </div>

          {/* Large Product Image Container — Expands with flex-1 */}
          <Link
            href={`/p/${anchor.slug}`}
            className="group my-4 block w-full flex-1 min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] xl:min-h-[460px] overflow-hidden rounded-media bg-porcelain"
          >
            <ProductImage
              product={anchor}
              view="hero"
              sizes="(min-width: 1024px) 450px, 90vw"
              className="h-full w-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105"
              imgClassName="!object-cover"
            />
          </Link>

          {/* Details, Specs, Price & Action — Tightly structured, zero dead space */}
          <div className="flex flex-col px-1 pb-1 sm:px-2 sm:pb-2">
            <Link
              href={`/p/${anchor.slug}`}
              className="display text-heading leading-tight tracking-[-0.01em] text-ink hover:text-brand-deep sm:text-display-xs"
            >
              {anchor.name}
            </Link>

            <div className="mt-1.5 flex items-center gap-2">
              <Rating value={anchor.rating} count={anchor.reviewCount} />
              <span className="text-meta text-mute">·</span>
              <span className="text-meta font-medium text-emerald-700">In stock</span>
            </div>

            <p className="mt-2 text-support text-ink-2 line-clamp-2 leading-relaxed">
              {anchor.summary}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {anchor.highlights.slice(0, 3).map((h) => (
                <span
                  key={h}
                  className="rounded-full bg-white px-2.5 py-1 text-meta text-ink-2 shadow-[var(--shadow-hair)] border border-line/60"
                >
                  ✓ {h}
                </span>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line/80 pt-4">
              <div>
                <p className="text-meta text-mute">Delivered price</p>
                <Price usd={anchor.price} size="lg" />
              </div>
              <button
                type="button"
                onClick={() => handleAddProduct(anchor)}
                suppressHydrationWarning
                className="btn btn-primary h-11 px-6 text-support font-semibold shadow-[0_2px_8px_rgb(var(--rgb-brand)/0.3)] transition-transform hover:scale-[1.02]"
              >
                <span>Add to cart</span>
                <Icon name="arrowRight" size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Complementary products */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:col-span-7">
          {complementary.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
