"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import type { Product, Variant } from "@/lib/types";
import { productViews, type ImageView } from "@/lib/images";
import { ProductImage } from "@/components/product/product-image";
import { Rating } from "@/components/product/rating";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/money";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { SignalDot } from "@/components/ui/signal";
import { usePrefs } from "@/components/providers";
import { useShop, useUI } from "@/lib/store";
import { bestTier, deliveryLabel, priceInsight, stockSignal, unitPrice } from "@/lib/commerce";
import { sellerById } from "@/lib/catalog/sellers";

/** A focused look at a product without leaving the grid: views, colours, the clarity answers and add-to-bag. */
export function QuickView({ product: p, initialVariant, onClose }: { product: Product; initialVariant: Variant; onClose: () => void }) {
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const [variant, setVariant] = useState(initialVariant);
  const [picked, setView] = useState<ImageView>("hero");
  const [qty, setQty] = useState(business ? Math.max(p.b2b.moq, 1) : 1);
  const addToCart = useShop((s) => s.addToCart);
  const openCart = useUI((s) => s.openCart);
  const seller = sellerById(p.sellerId);
  const insight = priceInsight(p);
  const stock = stockSignal(p);
  const tier = bestTier(p);
  const unit = business ? unitPrice(p, qty, { contract: true }) : p.price;

  const add = () => {
    addToCart(p.id, variant.id, qty, business);
    onClose();
    openCart();
  };

  const views = productViews(p, variant.id);
  const view = views.some((v) => v.id === picked) ? picked : "hero";

  return (
    <dialog
      ref={(d) => {
        if (d && !d.open) {
          d.showModal();
          d.querySelector<HTMLElement>("[data-autofocus]")?.focus();
        }
      }}
      aria-labelledby={`qv-${p.id}`}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
      className="m-auto max-h-[min(92dvh,760px)] w-[min(100vw-24px,1040px)] max-w-none overflow-hidden rounded-surface bg-porcelain p-0 text-ink shadow-[var(--shadow-lift)] backdrop:bg-ink/50 backdrop:backdrop-blur-sm open:animate-rise"
    >
      <div className="grid max-h-[inherit] overflow-y-auto md:grid-cols-[1.1fr_1fr]">
        <div className="relative p-3 md:p-4">
          <ProductImage
            key={`${variant.id}-${view}`}
            product={p}
            variant={variant.id}
            view={view}
            alt={`${p.name} in ${variant.name}`}
            sizes="(min-width: 768px) 520px, 100vw"
            className="aspect-[5/4] w-full animate-fade rounded-surface md:aspect-square"
          />
          <div className={clsx("absolute inset-x-6 bottom-6 flex gap-2 md:inset-x-7 md:bottom-7", views.length < 2 && "hidden")}>
            {views.map((vw) => (
              <button
                key={vw.id}
                type="button"
                aria-label={vw.label}
                aria-pressed={view === vw.id}
                onClick={() => setView(vw.id)}
                className={clsx(
                  "w-14 overflow-hidden rounded-control bg-white shadow-[var(--shadow-hair)] transition-shadow",
                  view === vw.id ? "ring-[1.5px] ring-ink" : "ring-1 ring-white/70",
                )}
              >
                <ProductImage product={p} variant={variant.id} view={vw.id} sizes="56px" className="aspect-square w-full" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col p-6 md:p-8 md:pl-4">
          <div className="flex items-start justify-between gap-4">
            <p className="text-support text-mute">{p.brand}</p>
            <form method="dialog">
              <button type="submit" data-autofocus aria-label="Close quick look" className="-mr-2 -mt-2 grid h-10 w-10 place-items-center rounded-full hover:bg-mist">
                <Icon name="close" size={18} />
              </button>
            </form>
          </div>
          <h2 id={`qv-${p.id}`} className="display mt-1 text-heading leading-[1.02] sm:text-display-sm">
            {p.name}
          </h2>
          <div className="mt-3">
            <Rating value={p.rating} count={p.reviewCount} />
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Price usd={unit} size="lg" strike={business ? undefined : p.compareAt} />
            {business ? (
              <span className="text-support text-mute">
                /{p.b2b.unit} · from {fmt(tier.price)} at {tier.min}+
              </span>
            ) : (
              insight.verifiedDeal && (
                <span className="glint inline-flex h-7 items-center gap-1.5 rounded-full bg-brand px-2.5 text-meta font-medium">
                  <Icon name="check" size={12} strokeWidth={2.4} /> {insight.label}
                </span>
              )
            )}
          </div>

          {p.variants.length > 1 && (
            <div className="mt-5">
              <p className="text-support">
                Colour <span className="text-mute">· {variant.name}</span>
              </p>
              <div className="-ml-1 mt-1.5 flex gap-1" role="radiogroup" aria-label="Colour">
                {p.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={v.id === variant.id}
                    aria-label={v.name}
                    onClick={() => setVariant(v)}
                    className="grid h-10 w-10 place-items-center rounded-full"
                  >
                    <span
                      className={clsx("h-7 w-7 rounded-full ring-offset-2 ring-offset-porcelain", v.id === variant.id ? "ring-[1.5px] ring-ink" : "ring-1 ring-line-strong")}
                      style={{ background: v.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <dl className="mt-5 divide-y divide-line border-y border-line text-support">
            {[
              ["Arrives", business ? `Lead time ${p.b2b.leadDays} days` : `${deliveryLabel(p)}${p.shipping === 0 ? " · free" : ` · +${fmt(p.shipping)}`}`],
              ["Available", stock.label],
              ["Seller", `${seller.name} · ${seller.onTime}% on time`],
              ["Returns", `${p.returns.days} days${p.returns.free ? ", free" : ""}`],
            ].map(([k, val], i) => (
              <div key={k} className="grid grid-cols-[96px_1fr] items-center py-2.5">
                <dt className="font-mono text-meta uppercase tracking-[0.12em] text-mute">{k}</dt>
                <dd className="flex items-center gap-1.5">
                  {i === 1 && <SignalDot tone={stock.tone} />}
                  {val}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex items-center gap-3 pt-6">
            <QtyStepper value={qty} onChange={setQty} min={business ? Math.max(p.b2b.moq, 1) : 1} label={`Quantity of ${p.name}`} />
            <button type="button" onClick={add} className="btn btn-primary flex-1">
              <Icon name="bag" size={17} /> {business ? "Add to cart" : "Add to cart"}
            </button>
          </div>
          <Link href={`/p/${p.slug}`} onClick={onClose} className="mt-4 inline-flex items-center gap-1.5 self-start text-support font-medium underline-offset-4 hover:underline">
            See full details, reviews &amp; specs <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </div>
    </dialog>
  );
}
