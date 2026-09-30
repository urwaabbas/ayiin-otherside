"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { productById } from "@/lib/catalog/products";
import { ProductImage } from "@/components/product/product-image";
import { Eyebrow } from "@/components/ui/signal";
import { Price } from "@/components/ui/money";
import { useHydrated, useShop } from "@/lib/store";
import { deliveryLabel } from "@/lib/commerce";

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
          <h2 id="recent-h" className="display mt-4 text-[36px] sm:text-[44px]">
            Pick up where you left off.
          </h2>
        </div>
        <p className="hidden text-[13px] text-mute sm:block">Only on this device · never shared</p>
      </div>
      <ul className="scroll-x -mx-[var(--gutter)] mt-8 flex gap-3 px-[var(--gutter)] pb-2" role="list">
        {items.map((p) => (
          <li key={p.id} className="w-[200px] shrink-0 animate-fade sm:w-[220px]">
            <Link href={`/p/${p.slug}`} className="group block">
              <span className="block overflow-hidden rounded-[20px]">
                <ProductImage product={p} sizes="220px" className="aspect-square w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />
              </span>
              <span className="mt-2.5 block truncate px-0.5 text-[13.5px] font-medium group-hover:underline">{p.name}</span>
              <span className="flex items-center justify-between gap-2 px-0.5 text-[12.5px] text-mute">
                <Price usd={p.price} size="sm" />
                <span className="truncate">Arrives {deliveryLabel(p)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
