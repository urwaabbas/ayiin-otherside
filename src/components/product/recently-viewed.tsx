"use client";

import type { Product } from "@/lib/types";
import { productById } from "@/lib/catalog/products";
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
      <ul className="scroll-x -mx-[var(--gutter)] mt-8 flex gap-4 px-[var(--gutter)] pb-2" role="list">
        {items.map((p) => (
          <li key={p.id} className="w-[200px] shrink-0 has-[.sr]:w-[244px] sm:has-[.sr]:w-[272px] animate-fade sm:w-[220px]">
            <ProductCard product={p} layout="compact" />
          </li>
        ))}
      </ul>
    </section>
  );
}
