"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";

export function EditorialPlusProducts({
  title = "The Everyday Upgrade",
  ctaLabel = "Explore the edit",
  ctaHref = "/search?sort=popular",
  image,
  products,
}: {
  title?: string;
  subtitle?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  image: string;
  products: Product[];
}) {
  return (
    <section aria-label={title} className="relative">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Editorial Visual Story Card (Left: 4 Cols) */}
        <div className="group relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-surface bg-ink text-white p-7 sm:p-9 lg:col-span-4 lg:min-h-full">
          {/* Background Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
          />

          {/* Scrim Overlay */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-radial-gradient from-transparent to-black/50"
          />

          {/* Bottom Editorial Content */}
          <div className="relative z-10 mt-auto pt-12">
            <h3 className="display text-heading leading-[0.98] tracking-[-0.02em] text-white sm:text-display-xs">
              {title}
            </h3>
            <Link
              href={ctaHref}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-support font-semibold text-ink shadow-md transition-all duration-300 hover:bg-brand hover:scale-[1.02]"
            >
              <span>{ctaLabel}</span>
              <Icon name="arrowRight" size={15} />
            </Link>
          </div>
        </div>

        {/* Supporting Products Shelf (Right: 8 Cols) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:col-span-8">
          {products.slice(0, 3).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
