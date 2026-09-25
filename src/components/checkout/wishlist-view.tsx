"use client";

import Link from "next/link";
import { productById, products } from "@/lib/catalog/products";
import { useHydrated, useShop } from "@/lib/store";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";
import type { Product } from "@/lib/types";

export function WishlistView() {
  const hydrated = useHydrated();
  const ids = useShop((s) => s.wishlist);
  const recent = useShop((s) => s.recent);
  if (!hydrated) return <div className="mt-10 h-[400px] rounded-[28px] bg-mist" />;
  const items = ids.map(productById).filter(Boolean) as Product[];
  const recentItems = (recent.map(productById).filter(Boolean) as Product[]).filter((p) => !ids.includes(p.id)).slice(0, 4);
  const fallback = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
  return (
    <div className="mt-8">
      {items.length === 0 ? (
        <div className="rounded-[32px] bg-white p-10 text-center shadow-[var(--shadow-hair)] sm:p-14">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mist">
            <Icon name="heart" size={24} />
          </span>
          <p className="display mt-6 text-[40px]">Nothing saved yet.</p>
          <p className="mx-auto mt-3 max-w-md text-[15px] text-mute">Tap the heart on anything. Ayiin watches the price and stock for you, and tells you when it drops.</p>
          <Link href="/search" className="btn btn-ink mt-6">Browse</Link>
        </div>
      ) : (
        <>
          <p className="mb-6 flex items-center gap-2 text-[14px] text-ink-2">
            <Icon name="bell" size={15} /> Watching price and stock on {items.length} {items.length === 1 ? "item" : "items"} — we&apos;ll email you on a genuine drop.
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}
      <h2 className="display mb-8 mt-20 text-[40px]">{recentItems.length ? "Recently viewed" : "Highly rated right now"}</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {(recentItems.length ? recentItems : fallback).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
