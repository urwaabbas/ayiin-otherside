"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product/product-image";
import { QuickView } from "@/components/product/quick-view";
import { Rating } from "@/components/product/rating";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/money";
import { SignalDot } from "@/components/ui/signal";
import { usePrefs } from "@/components/providers";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { bestTier, deliveryLabel, priceInsight, stockSignal, tierSavingPct } from "@/lib/commerce";
import { sellerById } from "@/lib/catalog/sellers";

const CARD_SIZES = "(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 50vw";

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
  const compared = useShop((s) => s.compare.includes(p.id));
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const toggleCompare = useShop((s) => s.toggleCompare);
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const insight = priceInsight(p);
  const stock = stockSignal(p);
  const seller = sellerById(p.sellerId);
  const tier = bestTier(p);
  const badge = business
    ? p.b2b.contractPrice
      ? { label: "Contract price", tone: "blue" as const }
      : p.tags.includes("bulk")
        ? { label: `Up to ${tierSavingPct(p, tier.price)}% off at volume`, tone: "ink" as const }
        : null
    : insight.verifiedDeal
      ? { label: insight.label, tone: "lime" as const }
      : p.tags.includes("new")
        ? { label: "New", tone: "ink" as const }
        : p.tags.includes("bestseller")
          ? { label: "Bestseller", tone: "white" as const }
          : null;

  const quickAdd = () => {
    const qty = business ? Math.max(p.b2b.moq, 1) : 1;
    addToCart(p.id, variant.id, qty, business);
    notify(`Added to ${business ? "cart" : "bag"}`, `${p.name} · Arrives ${deliveryLabel(p)}`);
  };

  return (
    <article className={clsx("group relative flex flex-col", className)}>
      <div className="relative overflow-hidden rounded-[22px] bg-white">
        <Link href={`/p/${p.slug}`} aria-label={p.name} className="block" prefetch={priority ? true : undefined}>
          <span className="relative block aspect-[4/4.4] w-full transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.035]">
            <ProductImage product={p} variant={variant.id} preload={priority} sizes={CARD_SIZES} className="absolute inset-0" />
            {/* second angle on hover (pointer devices only — display:none images are never fetched) */}
            <span className="absolute inset-0 hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100 [@media(hover:hover)]:block">
              <ProductImage product={p} variant={variant.id} view="angle" sizes={CARD_SIZES} className="h-full w-full" />
            </span>
          </span>
        </Link>
        {rank != null && (
          <span className="display pointer-events-none absolute bottom-3 left-4 text-[56px] leading-none text-ink/90">{String(rank).padStart(2, "0")}</span>
        )}
        {badge && (
          <span
            className={clsx(
              "pointer-events-none absolute left-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[11.5px] font-medium",
              badge.tone === "lime" && "glint bg-lime text-ink",
              badge.tone === "ink" && "bg-ink text-white",
              badge.tone === "blue" && "bg-blue text-ink",
              badge.tone === "white" && "bg-white/90 text-ink shadow-[var(--shadow-hair)] backdrop-blur",
            )}
          >
            {badge.tone === "lime" && <Icon name="check" size={12} strokeWidth={2.4} />}
            {badge.label}
          </span>
        )}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            type="button"
            aria-pressed={hydrated && wished}
            aria-label={wished ? `Remove ${p.name} from saved` : `Save ${p.name}`}
            onClick={() => toggleWishlist(p.id)}
            className={clsx(
              "grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-all duration-300",
              hydrated && wished ? "bg-ink text-lime" : "bg-white/85 text-ink shadow-[var(--shadow-hair)] hover:bg-white",
            )}
          >
            <Icon name="heart" size={17} fill={hydrated && wished ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            aria-pressed={hydrated && compared}
            aria-label={compared ? `Remove ${p.name} from compare` : `Compare ${p.name}`}
            title="Compare"
            onClick={() => toggleCompare(p.id)}
            className={clsx(
              "grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-all duration-300 lg:translate-x-2 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:focus-visible:translate-x-0 lg:focus-visible:opacity-100",
              hydrated && compared ? "!translate-x-0 bg-ink text-white !opacity-100" : "bg-white/85 text-ink shadow-[var(--shadow-hair)] hover:bg-white",
            )}
          >
            <Icon name="compare" size={17} />
          </button>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label={`Quick look at ${p.name}`}
            title="Quick look"
            onClick={() => setQuick(true)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/85 text-ink shadow-[var(--shadow-hair)] backdrop-blur transition-all delay-75 duration-300 hover:bg-white lg:translate-x-2 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100 lg:focus-visible:translate-x-0 lg:focus-visible:opacity-100"
          >
            <Icon name="eye" size={17} />
          </button>
        </div>
        <button
          type="button"
          onClick={quickAdd}
          className="absolute inset-x-3 bottom-3 hidden h-11 items-center justify-center gap-2 rounded-full bg-ink text-[13.5px] font-medium text-white opacity-0 shadow-[var(--shadow-lift)] transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 lg:flex lg:translate-y-3"
        >
          <Icon name="plus" size={16} />
          {business ? `Add ${Math.max(p.b2b.moq, 1)} ${p.b2b.unit}` : "Quick add"}
          <span className="text-white/60">·</span>
          <span className="text-white/70">{deliveryLabel(p)}</span>
        </button>
      </div>

      <div className="mt-3.5 flex flex-1 flex-col px-1">
        <div className="flex items-center justify-between gap-2 text-[12.5px]">
          <span className="min-w-0 truncate text-mute">
            {p.brand}
            {seller.verified && <span className="ml-1 text-ink-2" title="Verified seller">· Verified</span>}
          </span>
          <Rating value={p.rating} count={p.reviewCount} dense />
        </div>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug tracking-[-0.01em]">
          <Link href={`/p/${p.slug}`} className="hover:underline hover:decoration-1 hover:underline-offset-2">
            {p.name}
          </Link>
        </h3>

        {p.variants.length > 1 && (
          <div className="-ml-1 mt-1.5 flex items-center" role="radiogroup" aria-label="Colour">
            {p.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={variant.id === v.id}
                aria-label={v.name}
                title={v.name}
                onMouseEnter={() => setVariant(v)}
                onFocus={() => setVariant(v)}
                onClick={() => setVariant(v)}
                className="grid h-6 w-6 place-items-center rounded-full"
              >
                <span
                  className={clsx(
                    "h-4 w-4 rounded-full ring-offset-2 ring-offset-porcelain transition-shadow",
                    variant.id === v.id ? "ring-[1.5px] ring-ink" : "ring-1 ring-line-strong",
                  )}
                  style={{ background: v.color }}
                />
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2.5">
          {business ? (
            <>
              <div className="flex items-baseline gap-2">
                <Price usd={tier.price} size="md" />
                <span className="text-[12.5px] text-mute">
                  /{p.b2b.unit} at {tier.min}+
                </span>
              </div>
              <p className="mt-1 text-[12.5px] text-ink-2">
                <span className="num">{fmt(p.price)}</span> list · MOQ {p.b2b.moq}
                {p.b2b.caseQty > 1 && ` · case of ${p.b2b.caseQty}`}
              </p>
            </>
          ) : (
            <Price usd={p.price} size="md" strike={p.compareAt} />
          )}
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-ink-2">
            <SignalDot tone={stock.tone} live={p.delivery.max <= 1} />
            <span>
              {business ? `Lead time ${p.b2b.leadDays}d` : `Arrives ${deliveryLabel(p)}`}
              <span className="text-mute"> · {stock.urgent ? stock.label : p.shipping === 0 ? "Free delivery" : `+${fmt(p.shipping)} delivery`}</span>
            </span>
          </p>
          {reason && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mist px-2 py-1 text-[11.5px] text-ink-2">
              <Icon name="sparkle" size={11} /> {reason}
            </p>
          )}
        </div>
        <button type="button" onClick={quickAdd} className="btn btn-ghost btn-sm mt-3 w-full lg:hidden">
          <Icon name="plus" size={15} /> {business ? "Add to cart" : "Add to bag"}
        </button>
      </div>
      {quick && <QuickView product={p} initialVariant={variant} onClose={() => setQuick(false)} />}
    </article>
  );
}
