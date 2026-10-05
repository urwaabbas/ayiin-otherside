"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product/product-image";
import { ProductGallery } from "@/components/pdp/gallery";
import { Rating } from "@/components/product/rating";
import { PriceHistory } from "@/components/product/price-history";
import { Price } from "@/components/ui/money";
import { SignalDot } from "@/components/ui/signal";
import { Icon } from "@/components/ui/icon";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { usePrefs } from "@/components/providers";
import { useCutoff } from "@/components/home/clarity-card";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { sellerById } from "@/lib/catalog/sellers";
import { readableOn } from "@/lib/color";
import { priceOffers } from "@/lib/catalog/offers";
import { addBusinessDays, compact, fmtDay, relativeDay, todayUTC } from "@/lib/format";
import { deliveryLabel, nextTier, priceInsight, stockSignal, tierSavingPct, unitPrice } from "@/lib/commerce";


export function ProductExperience({ product: p, initialQty }: { product: Product; initialQty?: number }) {
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const hydrated = useHydrated();
  const [variant, setVariant] = useState(p.variants[0]);
  const [qty, setQty] = useState(() => (business ? Math.max(p.b2b.moq, initialQty ?? p.b2b.tiers[1]?.min ?? 1) : 1));
  const [express, setExpress] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [alert, setAlert] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const [showBar, setShowBar] = useState(false);
  const cutoff = useCutoff();

  const addToCart = useShop((s) => s.addToCart);
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const toggleCompare = useShop((s) => s.toggleCompare);
  const pushRecent = useShop((s) => s.pushRecent);
  const lists = useShop((s) => s.lists);
  const addToList = useShop((s) => s.addToList);
  const wished = useShop((s) => s.wishlist.includes(p.id));
  const compared = useShop((s) => s.compare.includes(p.id));
  const notify = useUI((s) => s.notify);
  const openCart = useUI((s) => s.openCart);

  // Re-seed quantity when the mode or product changes (adjusting state during render, not in an effect)
  const seedKey = `${business}-${p.id}-${initialQty ?? ""}`;
  const [lastSeed, setLastSeed] = useState(seedKey);
  if (lastSeed !== seedKey) {
    setLastSeed(seedKey);
    setQty(business ? Math.max(p.b2b.moq, initialQty ?? p.b2b.tiers[1]?.min ?? 1) : 1);
  }

  useEffect(() => {
    pushRecent(p.id);
  }, [p.id, pushRecent]);

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const seller = sellerById(p.sellerId);
  const stock = stockSignal(p);
  const insight = priceInsight(p);
  const unit = business ? unitPrice(p, qty, { contract: true }) : p.price;
  const nt = business ? nextTier(p, qty) : undefined;
  const expressDate = addBusinessDays(todayUTC(), 1);
  const arrives = express ? relativeDay(expressDate) : deliveryLabel(p);
  const expressFee = 9.99;
  const shippingCost = express ? expressFee : p.shipping;
  const returnBy = addBusinessDays(todayUTC(), p.delivery.max + Math.round((p.returns.days * 5) / 7));
  const offers = business ? priceOffers(p, qty) : [];

  const add = (andOpen = false) => {
    addToCart(p.id, variant.id, qty, business);
    if (andOpen) openCart();
    else notify(business ? "Added to cart" : "Added to cart", `${qty > 1 ? `${qty} × ` : ""}${p.name} · Arrives ${arrives}`);
  };

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* ── Gallery ─────────────────────────────────── */}
        <div className="min-w-0 lg:col-span-7">
          <div className="lg:sticky lg:top-[88px]">
            <ProductGallery
              product={p}
              variant={variant}
              overlay={
                <div className="pointer-events-none absolute left-4 right-16 top-4 flex flex-wrap gap-2">
                  {insight.verifiedDeal && !business && (
                    <span className="glint inline-flex h-8 items-center gap-1.5 rounded-full bg-brand px-3 text-meta font-medium">
                      <Icon name="check" size={13} strokeWidth={2.4} /> {insight.label}
                    </span>
                  )}
                  {p.tags.includes("assured") && (
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/90 px-3 text-meta font-medium shadow-[var(--shadow-hair)] backdrop-blur">
                      <Icon name="shield" size={13} /> Ayiin Assured
                    </span>
                  )}
                </div>
              }
            />
          </div>
        </div>

        {/* ── Buy box ─────────────────────────────────── */}
        <div className="min-w-0 lg:col-span-5">
          <div className="flex items-center justify-between gap-3 text-support">
            <Link href={`/search?q=${encodeURIComponent(p.brand)}`} className="font-medium text-ink-2 hover:text-ink">
              {p.brand}
            </Link>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-pressed={hydrated && wished}
                onClick={() => toggleWishlist(p.id)}
                className={clsx("grid h-10 w-10 place-items-center rounded-full transition-colors", hydrated && wished ? "bg-ink text-brand" : "hover:bg-soft")}
                aria-label={wished ? "Remove from saved" : "Save for later"}
              >
                <Icon name="heart" size={19} fill={hydrated && wished ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                aria-pressed={hydrated && compared}
                onClick={() => toggleCompare(p.id)}
                className={clsx("grid h-10 w-10 place-items-center rounded-full transition-colors", hydrated && compared ? "bg-ink text-white" : "hover:bg-soft")}
                aria-label={compared ? "Remove from compare" : "Add to compare"}
              >
                <Icon name="compare" size={19} />
              </button>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(window.location.href);
                  notify("Link copied", "Share it anywhere — prices stay honest.");
                }}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft"
                aria-label="Copy link"
              >
                <Icon name="share" size={19} />
              </button>
            </div>
          </div>
          <h1 className="mt-1 text-heading font-medium leading-[1.12] tracking-[-0.03em] sm:text-heading">{p.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-support">
            <a href="#reviews" className="hover:underline">
              <Rating value={p.rating} count={p.reviewCount} />
            </a>
            <span className="text-mute">
              <span className="num">{compact(p.soldLastWeek)}</span> bought this week
            </span>
            {business && <span className="num text-mute">SKU {p.b2b.sku}</span>}
          </div>
          <p className="mt-4 text-body leading-relaxed text-ink-2">{p.summary}</p>

          {/* Price */}
          <div className="mt-6 rounded-surface bg-white p-5 shadow-[var(--shadow-hair)]">
            {business ? (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <Price usd={unit} size="xl" />
                    <p className="mt-1 text-support text-mute">
                      per {p.b2b.unit} at {qty.toLocaleString("en-US")} · list <span className="num line-through">{fmt(p.price, { cents: true })}</span>
                    </p>
                  </div>
                  {tierSavingPct(p, unit) > 0 && <span className="rounded-full bg-brand px-3 py-1.5 text-support font-medium">−{tierSavingPct(p, unit)}%</span>}
                </div>
                {p.b2b.contractPrice && (
                  <p className="mt-3 flex items-center gap-2 rounded-control bg-info-soft px-3 py-2 text-meta text-info">
                    <Icon name="file" size={14} /> Northwind contract price {fmt(p.b2b.contractPrice, { cents: true })} applies at any quantity
                  </p>
                )}
                <table className="mt-4 w-full text-support">
                  <caption className="sr-only">Volume pricing</caption>
                  <thead>
                    <tr className="text-left text-mute">
                      <th className="pb-2 font-normal">Quantity</th>
                      <th className="pb-2 font-normal">Unit price</th>
                      <th className="pb-2 text-right font-normal">Saving</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.b2b.tiers.map((t, i) => {
                      const nextMin = p.b2b.tiers[i + 1]?.min;
                      const active = qty >= t.min && (!nextMin || qty < nextMin);
                      return (
                        <tr key={t.min} className={clsx("border-t border-line", active && "bg-brand-soft")}>
                          <td className="py-2 pl-2">
                            <button type="button" className="num hover:underline" onClick={() => setQty(Math.max(t.min, p.b2b.moq))}>
                              {t.min}
                              {nextMin ? `–${nextMin - 1}` : "+"}
                            </button>
                          </td>
                          <td className="num py-2 font-medium">{fmt(t.price, { cents: true })}</td>
                          <td className="num py-2 pr-2 text-right text-mute">{tierSavingPct(p, t.price) ? `−${tierSavingPct(p, t.price)}%` : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="mt-3 text-meta text-mute">
                  MOQ {p.b2b.moq} · {p.b2b.caseQty > 1 ? `Case of ${p.b2b.caseQty} · ` : ""}Lead time {p.b2b.leadDays} business {p.b2b.leadDays === 1 ? "day" : "days"}
                  {p.b2b.taxExemptEligible && " · Tax-exempt eligible"}
                </p>
              </>
            ) : (
              <>
                <div className="flex items-end justify-between gap-4">
                  <Price usd={p.price} size="xl" strike={p.compareAt} />
                  <div className="w-[120px]">
                    <PriceHistory history={p.history} height={34} />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-support">
                  <span className={clsx("inline-flex items-center gap-1.5", insight.verifiedDeal ? "font-medium text-brand-deep" : "text-ink-2")}>
                    {insight.verifiedDeal ? <Icon name="check" size={14} strokeWidth={2.2} /> : <Icon name="trend" size={14} />}
                    {insight.label}
                    <span className="font-normal text-mute">· typical {fmt(Math.round(insight.typical))}</span>
                  </span>
                  <button type="button" onClick={() => setAlert((a) => !a)} className="inline-flex items-center gap-1.5 text-ink-2 hover:text-ink" aria-pressed={alert}>
                    <Icon name="bell" size={14} fill={alert ? "currentColor" : "none"} /> {alert ? "Alert on" : "Price alert"}
                  </button>
                </div>
                <p className="mt-3 border-t border-line pt-3 text-support text-ink-2">
                  Total to your door: <span className="num font-medium text-ink">{fmt(p.price + shippingCost, { cents: !Number.isInteger(p.price + shippingCost) })}</span>
                  <span className="text-mute"> · {shippingCost ? `includes ${fmt(shippingCost)} delivery` : "free delivery"} · no fees at checkout</span>
                </p>
              </>
            )}
          </div>

          {/* Variants */}
          {p.variants.length > 1 && (
            <fieldset className="mt-6">
              <legend className="text-support">
                <span className="text-mute">{p.kind === "serum" || p.kind === "coffeebag" ? "Option" : "Colour"}:</span> <span className="font-medium">{variant.name}</span>
              </legend>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {p.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    aria-pressed={variant.id === v.id}
                    onClick={() => setVariant(v)}
                    className={clsx(
                      "flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-support transition-colors",
                      variant.id === v.id ? "border-ink bg-white" : "border-line hover:border-line-strong",
                    )}
                  >
                    <span className="h-6 w-6 rounded-full ring-1 ring-inset ring-ink/10" style={{ background: v.color }} />
                    {v.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* Delivery */}
          <div className="mt-6 overflow-hidden rounded-surface border border-line">
            <div className="flex items-start gap-3 p-4">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand shadow-[inset_0_0_0_1.5px_var(--color-ink)]">
                <Icon name="truck" size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body">
                  Arrives <span className="font-medium">{arrives}</span>
                  {!express && p.delivery.min !== p.delivery.max && <span className="text-mute"> · 94% on the first date</span>}
                </p>
                <p className="mt-0.5 text-support text-mute">
                  {cutoff ? (
                    <>
                      Order within <span className="num text-ink">{cutoff}</span> · to San Francisco 94107
                    </>
                  ) : (
                    "to San Francisco 94107"
                  )}
                </p>
              </div>
            </div>
            {!business && (
              <div className="grid grid-cols-2 border-t border-line text-support">
                {[
                  { on: !express, label: "Standard", sub: `${deliveryLabel(p)} · ${p.shipping ? fmt(p.shipping) : "Free"}`, set: () => setExpress(false) },
                  { on: express, label: "Express", sub: `${relativeDay(expressDate)} · ${fmt(expressFee)}`, set: () => setExpress(true) },
                ].map((o) => (
                  <button key={o.label} type="button" aria-pressed={o.on} onClick={o.set} className={clsx("px-4 py-3 text-left transition-colors first:border-r first:border-line", o.on ? "bg-white" : "hover:bg-white/60")}>
                    <span className="flex items-center gap-2 font-medium">
                      <span className={clsx("h-3.5 w-3.5 rounded-full border", o.on ? "border-[4px] border-ink" : "border-line-strong")} />
                      {o.label}
                    </span>
                    <span className="mt-0.5 block pl-[22px] text-mute">{o.sub}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 border-t border-line px-4 py-3 text-support text-ink-2">
              <SignalDot tone={stock.tone} live={stock.tone === "success"} />
              {stock.label}
              <span className="text-mute">· ships from {seller.location.split(" · ")[0]}</span>
            </div>
          </div>

          {/* Actions */}
          <div ref={buyRef} className="mt-6 flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} min={business ? p.b2b.moq : 1} size="lg" label="Quantity" />
            <button type="button" onClick={() => add()} className="btn btn-primary min-w-[180px] flex-1">
              <Icon name="bag" size={18} /> {business ? `Add to cart · ${fmt(unit * qty)}` : "Add to cart"}
            </button>
          </div>
          {nt && (
            <p className="mt-2 text-support text-info">
              Add {nt.min - qty} more to pay {fmt(nt.price, { cents: true })}/{p.b2b.unit} — saves {fmt((unit - nt.price) * nt.min)}
            </p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-3">
            {business ? (
              <>
                <div className="relative">
                  <button type="button" onClick={() => setListOpen((o) => !o)} aria-expanded={listOpen} className="btn btn-secondary w-full">
                    <Icon name="list" size={17} /> Add to list
                  </button>
                  {listOpen && (
                    <div className="absolute left-0 right-0 top-[52px] z-20 rounded-surface bg-white p-1.5 shadow-[var(--shadow-float)]">
                      {lists.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => {
                            addToList(l.id, p.id, variant.id, qty);
                            setListOpen(false);
                            notify(`Added to “${l.name}”`, `${qty} × ${p.name}`, { label: "View list", href: `/business?tab=lists&list=${l.id}` });
                          }}
                          className="flex w-full items-center justify-between rounded-control px-3 py-2.5 text-left text-support hover:bg-mist"
                        >
                          {l.name} <span className="text-mute">{l.items.length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Link href={`/business?tab=quotes&product=${p.slug}&qty=${qty}`} className="btn btn-secondary w-full">
                  <Icon name="file" size={17} /> Request quote
                </Link>
              </>
            ) : (
              <>
                <button type="button" onClick={() => add(true)} className="btn btn-secondary col-span-2 w-full">
                  <Icon name="bolt" size={17} /> Buy now — guest checkout
                </button>
              </>
            )}
          </div>

          {/* Assurance */}
          <ul className="mt-6 divide-y divide-line rounded-surface bg-white text-support shadow-[var(--shadow-hair)]">
            <li className="flex gap-3 p-4">
              <Icon name="returns" size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{p.returns.free ? "Free returns" : "Returns accepted"} until {fmtDay(returnBy)}</p>
                <p className="text-mute">
                  {p.returns.days} days from delivery · prepaid label · refund within 2 days of drop-off{p.returns.free ? "" : " · $5.95 return shipping"}
                </p>
              </div>
            </li>
            <li className="flex gap-3 p-4">
              <Icon name="shield" size={18} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Ayiin Assured purchase</p>
                <p className="text-mute">Payment held until delivery. Full refund if it doesn&apos;t arrive or isn&apos;t as described.</p>
              </div>
            </li>
            {p.specs.Warranty && (
              <li className="flex gap-3 p-4">
                <Icon name="check" size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{p.specs.Warranty} warranty</p>
                  <p className="text-mute">Claims handled by Ayiin — you never chase the manufacturer.</p>
                </div>
              </li>
            )}
          </ul>

          {/* Seller */}
          <div className="mt-4 rounded-surface bg-white p-4 shadow-[var(--shadow-hair)]">
            <div className="flex items-center gap-3">
              <span className="num grid h-11 w-11 shrink-0 place-items-center rounded-full text-support font-medium" style={{ background: seller.color, color: readableOn(seller.color) }}>
                {seller.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-support font-medium">
                  Sold by {seller.name} {seller.verified && <Icon name="shield" size={14} className="text-brand-deep" />}
                </p>
                <p className="truncate text-meta text-mute">
                  {seller.tagline} · on Ayiin since {seller.since}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-line pt-3 text-center">
              {[
                [`${seller.onTime}%`, "On time"],
                [seller.rating.toFixed(1), "Rating"],
                [`${seller.responseHours}h`, "Replies"],
                [`${seller.returnRate}%`, "Returns"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dd className="num text-body font-medium">{v}</dd>
                  <dt className="text-meta text-mute">{l}</dt>
                </div>
              ))}
            </dl>
            {business && offers.length > 1 && (
              <div className="mt-4 border-t border-line pt-3">
                <p className="eyebrow mb-2">Also stocked by</p>
                <ul className="space-y-1.5 text-support">
                  {offers
                    .filter((o) => o.sellerId !== p.sellerId)
                    .map((o) => (
                      <li key={o.sellerId} className="flex items-center justify-between">
                        <span>
                          {sellerById(o.sellerId).name} <span className="text-mute">· {o.leadDays}d · MOQ {o.moq}</span>
                        </span>
                        <span className="num font-medium">{fmt(o.unit, { cents: true })}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile / scrolled sticky purchase bar */}
      <div
        className={clsx(
          "fixed inset-x-0 bottom-[62px] z-40 border-t border-line bg-porcelain/90 px-4 py-3 backdrop-blur-xl transition-transform duration-500 ease-[var(--ease-out-expo)] lg:bottom-0",
          showBar ? "translate-y-0" : "pointer-events-none translate-y-[140%]",
        )}
        inert={!showBar}
      >
        <div className="mx-auto flex max-w-[1520px] items-center gap-3 lg:px-6">
          <ProductImage product={p} variant={variant.id} sizes="44px" className="hidden h-11 w-11 rounded-control sm:block" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-support font-medium">{p.name}</p>
            <p className="truncate text-meta text-mute">
              <span className="num text-ink">{fmt(unit * qty, { cents: !Number.isInteger(unit * qty) })}</span> · Arrives {arrives}
            </p>
          </div>
          <button type="button" onClick={() => add()} className="btn btn-primary shrink-0">
            {business ? "Add to cart" : "Add to cart"}
          </button>
        </div>
      </div>
    </>
  );
}
