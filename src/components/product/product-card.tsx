"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product/product-image";
import { QuickView } from "@/components/product/quick-view";
import { Stars } from "@/components/product/rating";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/money";
import { usePrefs } from "@/components/providers";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { bestTier, deliveryLabel, priceInsight, savingsPct, stockSignal } from "@/lib/commerce";
import { compact } from "@/lib/format";

const CARD_SIZES = "(min-width: 1280px) 240px, (min-width: 1024px) 22vw, (min-width: 640px) 32vw, 48vw";

/**
 * The Ayiin product card — one marketplace card used in every grid and rail.
 * Same size in any row: a square white photo box (the product photo is shown whole,
 * never cropped or stretched), a two-line title, rating, price, delivery and Add to cart.
 * The button sits on the card's baseline, so cards line up however long the title is.
 */
export function ProductCard({
  product: p,
  reason,
  rank,
  className,
  priority,
}: {
  product: Product;
  reason?: string;
  rank?: number;
  className?: string;
  priority?: boolean;
}) {
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const hydrated = useHydrated();
  const [variant, setVariant] = useState(p.variants[0]);
  const [quick, setQuick] = useState(false);
  const wished = useShop((s) => s.wishlist.includes(p.id));
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const insight = priceInsight(p);
  const stock = stockSignal(p);
  const tier = bestTier(p);
  const off = savingsPct(p);

  const badge = rank != null ? `#${rank} Best Seller` : insight.verifiedDeal ? "Deal" : p.tags.includes("bestseller") ? "Best Seller" : p.tags.includes("new") ? "New" : null;

  const add = () => {
    const qty = business ? Math.max(p.b2b.moq, 1) : 1;
    addToCart(p.id, variant.id, qty, business);
    notify("Added to cart", `${p.name} · Arrives ${deliveryLabel(p)}`, { label: "View cart", href: "/cart" });
  };

  return (
    <article className={clsx("mk-card group relative", className)}>
      <div className="relative p-3 pb-0">
        <Link href={`/p/${p.slug}`} aria-label={p.name} prefetch={priority ? true : undefined} className="block overflow-hidden rounded-md bg-white">
          <ProductImage product={p} variant={variant.id} preload={priority} sizes={CARD_SIZES} className="aspect-square w-full" imgClassName="!object-contain" />
        </Link>
        {badge && (
          <span className={clsx("pointer-events-none absolute left-3 top-3 rounded-br-md rounded-tl-md px-2 py-1 text-[11.5px] font-semibold", badge === "Deal" ? "bg-danger text-white" : "bg-brand text-ink")}>
            {badge}
          </span>
        )}
        <button
          type="button"
          aria-pressed={hydrated && wished}
          aria-label={wished ? `Remove ${p.name} from saved` : `Save ${p.name}`}
          onClick={() => toggleWishlist(p.id)}
          className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink shadow-[var(--shadow-hair)] transition-colors hover:text-danger"
        >
          <Icon name="heart" size={16} fill={hydrated && wished ? "currentColor" : "none"} className={hydrated && wished ? "text-danger" : undefined} />
        </button>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setQuick(true)}
          className="absolute inset-x-6 bottom-3 hidden h-8 items-center justify-center rounded-md bg-white/95 text-[12.5px] font-medium text-ink opacity-0 shadow-[var(--shadow-soft)] transition-opacity group-hover:opacity-100 focus-visible:opacity-100 lg:flex"
        >
          Quick look
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 min-h-[2.6em] text-[14px] leading-[1.3] text-ink">
          <Link href={`/p/${p.slug}`} className="hover:text-brand-deep hover:underline">
            {p.name}
          </Link>
        </h3>
        <p className="mt-0.5 truncate text-[12px] text-mute">by {p.brand}</p>

        <Link href={`/p/${p.slug}#reviews`} className="mt-1 flex items-center gap-1.5 text-[12.5px]" aria-label={`${p.rating.toFixed(1)} out of 5 stars, ${p.reviewCount} ratings`}>
          <span className="num font-medium text-ink">{p.rating.toFixed(1)}</span>
          <Stars value={p.rating} size={13} />
          <span className="text-brand-deep hover:underline">({compact(p.reviewCount)})</span>
        </Link>
        {p.soldLastWeek >= 500 && <p className="mt-0.5 text-[12px] text-mute">{compact(p.soldLastWeek)}+ bought last week</p>}

        {p.variants.length > 1 && (
          <div className="-ml-0.5 mt-1.5 flex items-center gap-0.5" role="radiogroup" aria-label="Colour">
            {p.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={variant.id === v.id}
                aria-label={v.name}
                title={v.name}
                onMouseEnter={() => setVariant(v)}
                onClick={() => setVariant(v)}
                className="grid h-6 w-6 place-items-center"
              >
                <span className={clsx("h-4 w-4 rounded-full", variant.id === v.id ? "ring-2 ring-brand ring-offset-1" : "ring-1 ring-line-strong")} style={{ background: v.color }} />
              </button>
            ))}
          </div>
        )}

        <div className="mt-2">
          {business ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <Price usd={tier.price} size="md" />
                <span className="text-[12px] text-mute">/{p.b2b.unit} at {tier.min}+</span>
              </div>
              <p className="text-[12px] text-mute">
                List <span className="num line-through">{fmt(p.price)}</span> · MOQ {p.b2b.moq}
              </p>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-x-2">
                {off > 0 && <span className="text-[15px] font-medium text-danger">-{off}%</span>}
                <Price usd={p.price} size="md" />
              </div>
              {p.compareAt && p.compareAt > p.price && (
                <p className="text-[12px] text-mute">
                  List: <span className="num line-through">{fmt(p.compareAt)}</span>
                </p>
              )}
            </>
          )}
        </div>

        <p className="mt-1.5 text-[12.5px] text-ink-2">
          {business ? (
            <>Lead time {p.b2b.leadDays} days</>
          ) : (
            <>
              {p.shipping === 0 ? "FREE delivery " : `${fmt(p.shipping)} delivery `}
              <span className="font-semibold text-ink">{deliveryLabel(p)}</span>
            </>
          )}
        </p>
        {stock.urgent && <p className="mt-0.5 text-[12px] font-medium text-danger">{stock.label}</p>}
        {reason && <p className="mt-1 text-[12px] text-mute">{reason}</p>}

        <div className="mt-auto pt-3">
          <button type="button" onClick={add} disabled={p.stock <= 0} className="btn btn-brand h-9 w-full text-[13px]">
            {business ? `Add ${Math.max(p.b2b.moq, 1)} to cart` : "Add to cart"}
          </button>
        </div>
      </div>
      {quick && <QuickView product={p} initialVariant={variant} onClose={() => setQuick(false)} />}
    </article>
  );
}
