"use client";

import type { Product } from "@/lib/types";
import { productById } from "@/lib/catalog/products";
import { CardRail } from "@/components/home/card-rail";
import { ProductCard } from "@/components/product/product-card";
import { Eyebrow } from "@/components/ui/signal";
import { useHydrated, useShop } from "@/lib/store";

/**
 * "Pick up where you left off" — the last products this device looked at.
 * `exclude` takes the product ids already on the page, so nothing repeats.
 * Renders nothing until there are at least two to show.
 */
export function RecentlyViewed({ exclude, index, className }: { exclude?: string | readonly string[]; index?: string; className?: string }) {
  const hydrated = useHydrated();
  const recent = useShop((s) => s.recent);
  const skip = new Set(typeof exclude === "string" ? [exclude] : exclude);
  const items = hydrated ? (recent.filter((id) => !skip.has(id)).map(productById).filter(Boolean).slice(0, 8) as Product[]) : [];
  if (items.length < 2) return null;
  return (
    <section aria-labelledby="recent-h" className={className}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Eyebrow index={index}>Recently viewed</Eyebrow>
          <h2 id="recent-h" className="display mt-4 text-display-sm sm:text-display-sm">
            Pick up where you left off.
          </h2>
        </div>
        <p className="hidden text-support text-mute sm:block">Only on this device · never shared</p>
      </div>
      <div className="mt-8">
        <CardRail flow label="Recently viewed">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </CardRail>
      </div>
    </section>
  );
}
