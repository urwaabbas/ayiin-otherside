"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product/product-image";
import { Rating } from "@/components/product/rating";
import { Price } from "@/components/ui/money";
import { SignalDot } from "@/components/ui/signal";
import { Icon } from "@/components/ui/icon";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { usePrefs } from "@/components/providers";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { deliveryLabel, nextTier, priceInsight, stockSignal, tierSavingPct, unitPrice } from "@/lib/commerce";
import { sellerById } from "@/lib/catalog/sellers";

/** Dense, scannable row — the default for business buyers, available to everyone. */
export function ProductRow({ product: p }: { product: Product }) {
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const hydrated = useHydrated();
  const [qty, setQty] = useState(business ? Math.max(p.b2b.moq, p.b2b.tiers[1]?.min ?? 1) : 1);
  const addToCart = useShop((s) => s.addToCart);
  const toggleCompare = useShop((s) => s.toggleCompare);
  const compared = useShop((s) => s.compare.includes(p.id));
  const notify = useUI((s) => s.notify);
  const seller = sellerById(p.sellerId);
  const stock = stockSignal(p);
  const insight = priceInsight(p);
  const unit = business ? unitPrice(p, qty, { contract: true }) : p.price;
  const nt = business ? nextTier(p, qty) : undefined;

  return (
    <article className="grid grid-cols-[96px_1fr] gap-4 rounded-[22px] bg-white p-3 shadow-[var(--shadow-hair)] transition-shadow hover:shadow-[var(--shadow-soft)] sm:grid-cols-[132px_1fr_auto] sm:gap-5">
      <Link href={`/p/${p.slug}${business ? `?qty=${qty}` : ""}`} aria-label={p.name} tabIndex={-1} className="row-span-2 overflow-hidden rounded-2xl sm:row-span-1">
        <ProductImage product={p} className="aspect-square w-full" />
      </Link>
      <div className="min-w-0 py-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-mute">
          <span>{p.brand}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            {seller.name} {seller.verified && <Icon name="shield" size={12} className="text-brand-deep" />}
          </span>
          {business && (
            <>
              <span>·</span>
              <span className="num">{p.b2b.sku}</span>
            </>
          )}
        </div>
        <h3 className="mt-1 text-[16px] font-medium leading-snug tracking-[-0.01em]">
          <Link href={`/p/${p.slug}`} className="hover:underline hover:underline-offset-2">
            {p.name}
          </Link>
        </h3>
        <div className="mt-1.5">
          <Rating value={p.rating} count={p.reviewCount} />
        </div>
        <ul className="mt-2 hidden flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-2 md:flex">
          {p.highlights.slice(0, 3).map((h) => (
            <li key={h} className="flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-ink" /> {h}
            </li>
          ))}
        </ul>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-2">
          <span className="inline-flex items-center gap-1.5">
            <SignalDot tone={stock.tone} /> {stock.label}
          </span>
          <span>{business ? `Lead time ${p.b2b.leadDays}d · arrives ${deliveryLabel(p)}` : `Arrives ${deliveryLabel(p)}`}</span>
          <span className="text-mute">{p.returns.free ? `Free ${p.returns.days}-day returns` : `${p.returns.days}-day returns`}</span>
        </p>
      </div>

      <div className="col-span-2 flex flex-col gap-3 border-t border-line pt-3 sm:col-span-1 sm:w-[260px] sm:border-l sm:border-t-0 sm:pl-5 sm:pt-1">
        {business ? (
          <>
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <Price usd={unit} size="md" />
                <span className="text-[12px] text-mute">
                  /{p.b2b.unit}
                  {tierSavingPct(p, unit) > 0 && <span className="text-sale"> · −{tierSavingPct(p, unit)}%</span>}
                </span>
              </div>
              <div className="mt-2 flex gap-1" aria-label="Volume tiers">
                {p.b2b.tiers.map((t) => (
                  <span
                    key={t.min}
                    title={`${t.min}+ at ${fmt(t.price, { cents: true })}`}
                    className={clsx("num flex-1 rounded-md px-1 py-1 text-center text-[10.5px]", qty >= t.min ? "bg-ink text-white" : "bg-mist text-mute")}
                  >
                    {t.min}+
                  </span>
                ))}
              </div>
              {nt && (
                <p className="mt-1.5 text-[11.5px] text-info">
                  {nt.min - qty} more → {fmt(nt.price, { cents: true })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <QtyStepper value={qty} onChange={setQty} min={p.b2b.moq} size="sm" label={`Quantity of ${p.name}`} />
              <button
                type="button"
                onClick={() => {
                  addToCart(p.id, p.variants[0].id, qty, true);
                  notify("Added to cart", `${qty} × ${p.name} · ${fmt(unit * qty, { cents: true })}`);
                }}
                className="btn btn-ink btn-sm flex-1"
              >
                Add · <span className="num">{fmt(unit * qty)}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <Price usd={p.price} size="lg" strike={p.compareAt} />
              {insight.verifiedDeal && <p className="mt-1 text-[12px] font-medium text-brand-deep">✓ {insight.label}</p>}
              <p className="mt-1 text-[12px] text-mute">{p.shipping ? `+ ${fmt(p.shipping)} delivery` : "Free delivery · no fees at checkout"}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  addToCart(p.id, p.variants[0].id, 1);
                  notify("Added to bag", `${p.name} · Arrives ${deliveryLabel(p)}`);
                }}
                className="btn btn-ink btn-sm flex-1"
              >
                Add to bag
              </button>
              <button
                type="button"
                aria-pressed={hydrated && compared}
                onClick={() => toggleCompare(p.id)}
                className={clsx("btn btn-sm w-10 !px-0", hydrated && compared ? "btn-ink" : "btn-ghost")}
                aria-label={`Compare ${p.name}`}
              >
                <Icon name="compare" size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
