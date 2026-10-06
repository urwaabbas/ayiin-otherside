"use client";

import Link from "next/link";
import { productBySlug } from "@/lib/catalog/products";
import { ProductImage } from "@/components/product/product-image";
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
    .filter(Boolean);

  if (!anchor) return null;

  const handleAddAnchor = () => {
    addToCart(anchor.id, anchor.variants[0].id, 1, false);
    notify("Added to cart", `${anchor.name} · Arrives ${deliveryLabel(anchor)}`, {
      label: "View cart",
      href: "/cart",
    });
  };

  return (
    <section
      aria-label="Complete the setup"
      className="rounded-[24px] border border-line bg-white p-6 shadow-[var(--shadow-hair)] sm:p-8 lg:p-10"
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
        <div className="flex flex-col justify-between overflow-hidden rounded-surface border border-line bg-porcelain/60 p-6 sm:p-7 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-meta font-medium text-ink shadow-[var(--shadow-hair)]">
                <SignalDot tone="brand" live /> Anchor piece
              </span>
              <span className="text-meta text-mute">{anchor.brand}</span>
            </div>

            <Link
              href={`/p/${anchor.slug}`}
              className="group my-5 block overflow-hidden rounded-control bg-white p-4 shadow-[var(--shadow-hair)]"
            >
              <ProductImage
                product={anchor}
                view="hero"
                sizes="(min-width: 1024px) 380px, 90vw"
                className="aspect-square w-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105"
                imgClassName="!object-contain"
              />
            </Link>

            <Link
              href={`/p/${anchor.slug}`}
              className="text-emphasis font-medium text-ink hover:text-brand-deep hover:underline"
            >
              {anchor.name}
            </Link>

            <p className="mt-2 text-support text-ink-2 leading-relaxed">
              {anchor.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {anchor.highlights.slice(0, 3).map((h) => (
                <span
                  key={h}
                  className="rounded-full bg-white px-2.5 py-1 text-meta text-ink-2 shadow-[var(--shadow-hair)]"
                >
                  ✓ {h}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-line/80 pt-5">
            <div>
              <p className="text-meta text-mute">Delivered price</p>
              <Price usd={anchor.price} size="lg" />
            </div>
            <button
              type="button"
              onClick={handleAddAnchor}
              suppressHydrationWarning
              className="btn btn-primary"
            >
              <span>Add to cart</span>
              <Icon name="arrowRight" size={16} />
            </button>
          </div>
        </div>

        {/* 4 Complementary Products Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
          {complementary.map((p) => {
            if (!p) return null;
            return (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-surface border border-line bg-white p-4 transition-all duration-300 hover:border-line-strong hover:shadow-[var(--shadow-soft)]"
              >
                <div>
                  <Link
                    href={`/p/${p.slug}`}
                    className="block overflow-hidden rounded-control bg-porcelain/50 p-2"
                  >
                    <ProductImage
                      product={p}
                      view="hero"
                      sizes="(min-width: 1024px) 180px, 45vw"
                      className="aspect-square w-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105"
                      imgClassName="!object-contain"
                    />
                  </Link>

                  <p className="mt-3 truncate text-meta font-medium uppercase tracking-wider text-mute">
                    {p.brand}
                  </p>
                  <Link
                    href={`/p/${p.slug}`}
                    className="mt-0.5 line-clamp-2 text-support font-medium text-ink hover:text-brand-deep hover:underline"
                  >
                    {p.name}
                  </Link>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-line/70 pt-3">
                  <Price usd={p.price} size="sm" />
                  <Link
                    href={`/p/${p.slug}`}
                    className="chip text-meta hover:bg-mist"
                  >
                    <span>View item</span>
                    <Icon name="arrowRight" size={12} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
