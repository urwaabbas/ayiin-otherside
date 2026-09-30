"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import { VOLUME_PRODUCTS, priceOffers } from "@/lib/catalog/offers";
import type { Product } from "@/lib/types";
import { sellerById } from "@/lib/catalog/sellers";
import { nextTier, tierSavingPct, unitPrice } from "@/lib/commerce";
import { ProductImage } from "@/components/product/product-image";
import { readableOn } from "@/lib/color";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { useShop, useUI } from "@/lib/store";

const STOPS = [1, 5, 10, 25, 50, 100, 150, 200, 250, 500, 1000];

export function VolumeExplorer({ items = VOLUME_PRODUCTS }: { items?: Product[] }) {
  const { fmt } = usePrefs();
  const [pi, setPi] = useState(0);
  const [stop, setStop] = useState(4);
  const p = items[pi];
  const qty = STOPS[stop];
  const unit = unitPrice(p, qty);
  const offers = priceOffers(p, qty);
  const nt = nextTier(p, qty);
  const activeMin = p.b2b.tiers.filter((t) => t.min <= qty).pop()?.min;
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);

  return (
    <div className="overflow-hidden rounded-[32px] bg-white shadow-[var(--shadow-hair)]">
      <div role="tablist" aria-label="Product" className="scroll-x flex gap-1 border-b border-line p-2">
        {items.map((vp, i) => (
          <button
            key={vp.id}
            type="button"
            role="tab"
            aria-selected={i === pi}
            onClick={() => setPi(i)}
            className={clsx(
              "flex shrink-0 items-center gap-2.5 rounded-2xl py-1.5 pl-1.5 pr-4 text-[13.5px] transition-colors",
              i === pi ? "bg-ink text-white" : "text-ink-2 hover:bg-mist",
            )}
          >
            <ProductImage product={vp} sizes="36px" className="h-9 w-9 rounded-xl" />
            {vp.name.split(/ — |, /)[0]}
          </button>
        ))}
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_1.15fr]">
        <div className="border-b border-line p-6 sm:p-8 lg:border-b-0 lg:border-r">
          <label htmlFor="vol-qty" className="eyebrow">
            Quantity · {p.b2b.unit}
          </label>
          <div className="mt-3 flex items-end justify-between gap-4">
            <p className="display text-[64px] leading-none tabular-nums">{qty.toLocaleString("en-US")}</p>
            <div className="text-right">
              <p className="num text-[28px] font-medium tracking-[-0.03em]">{fmt(unit, { cents: true })}</p>
              <p className="text-[12.5px] text-mute">per {p.b2b.unit}</p>
            </div>
          </div>
          <input
            id="vol-qty"
            type="range"
            min={0}
            max={STOPS.length - 1}
            value={stop}
            onChange={(e) => setStop(Number(e.target.value))}
            aria-valuetext={`${qty} units`}
            className="mt-6 w-full accent-ink"
          />
          <div className="mt-1 flex justify-between font-mono text-[10.5px] text-mute">
            <span>1</span>
            <span>1,000</span>
          </div>

          <ol className="mt-6 grid grid-cols-4 gap-2">
            {p.b2b.tiers.map((t) => {
              const active = t.min === activeMin;
              return (
                <li
                  key={t.min}
                  className={clsx(
                    "rounded-2xl p-3 transition-colors duration-300",
                    active ? "bg-brand text-ink shadow-[inset_0_0_0_1.5px_var(--color-ink)]" : "bg-mist text-ink-2",
                  )}
                >
                  <p className="num text-[11.5px]">{t.min}+</p>
                  <p className="num mt-1 text-[14.5px] font-medium">{fmt(t.price, { cents: true })}</p>
                  <p className="num text-[11px]">{tierSavingPct(p, t.price) ? `−${tierSavingPct(p, t.price)}%` : "List"}</p>
                </li>
              );
            })}
          </ol>
          <div className="mt-6 space-y-1.5 text-[14px]">
            <p className="flex justify-between">
              <span className="text-mute">Total at list</span> <span className="num text-mute line-through">{fmt(p.price * qty, { cents: true })}</span>
            </p>
            <p className="flex justify-between font-medium">
              <span>Your total</span> <span className="num">{fmt(unit * qty, { cents: true })}</span>
            </p>
            {nt && (
              <p className="rounded-xl bg-info-soft px-3 py-2 text-[13px] text-info">
                Order {nt.min - qty} more to reach {fmt(nt.price, { cents: true })}/{p.b2b.unit} — saves {fmt((unit - nt.price) * nt.min)} on {nt.min}.
              </p>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <p className="eyebrow">{offers.length} verified suppliers · landed cost</p>
            <span className="text-[12px] text-mute">incl. delivery</span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {offers.map((o, i) => {
              const s = sellerById(o.sellerId);
              const best = i === 0 && o.eligible;
              return (
                <li
                  key={o.sellerId}
                  className={clsx(
                    "rounded-2xl border p-4 transition-colors",
                    best ? "border-ink bg-porcelain" : "border-line",
                    !o.eligible && "opacity-55",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-medium" style={{ background: s.color, color: readableOn(s.color) }}>
                        {s.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate text-[14px] font-medium">
                          {s.name}
                          {best && <span className="rounded-full bg-brand px-2 py-0.5 text-[10.5px] font-medium">Best value</span>}
                        </p>
                        <p className="truncate text-[12px] text-mute">
                          <span className="num">{s.onTime}%</span> on time · {o.leadDays}d lead · MOQ {o.moq}
                          {s.netTerms && ` · ${s.netTerms.split(" / ")[0]}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="num text-[15px] font-medium">{fmt(o.total, { cents: true })}</p>
                      <p className="num text-[11.5px] text-mute">{o.eligible ? `${fmt(o.unit, { cents: true })}/unit` : `MOQ ${o.moq}`}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                addToCart(p.id, p.variants[0].id, qty, true);
                notify("Added to cart", `${qty} × ${p.name.split(" — ")[0]} at ${fmt(unit, { cents: true })}`);
              }}
              className="btn btn-ink"
            >
              <Icon name="plus" size={16} /> Add {qty.toLocaleString("en-US")} to cart
            </button>
            <Link href={`/business?tab=quotes&product=${p.slug}&qty=${qty}`} className="btn btn-ghost">
              Negotiate a better price
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
