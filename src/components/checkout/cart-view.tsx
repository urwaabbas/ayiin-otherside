"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import { productById } from "@/lib/catalog/products";
import { sellerById } from "@/lib/catalog/sellers";
import {
  deliveryLabel,
  FREE_SHIPPING_THRESHOLD,
  nextTier,
  TAX_RATE,
} from "@/lib/commerce";
import {
  cartSummary,
  lineUnitPrice,
  useHydrated,
  useShop,
  useUI,
  type CartLine,
} from "@/lib/store";
import { company } from "@/lib/b2b/seed";
import { ProductImage } from "@/components/product/product-image";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { SignalDot } from "@/components/ui/signal";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { Loading, SplitSkeleton } from "@/components/ui/skeleton";

export function CartView() {
  const hydrated = useHydrated();
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const cart = useShop((s) => s.cart);
  const saved = useShop((s) => s.saved);
  const moveToCart = useShop((s) => s.moveToCart);
  const createList = useShop((s) => s.createList);
  const addToList = useShop((s) => s.addToList);
  const notify = useUI((s) => s.notify);
  const [promo, setPromo] = useState("");
  const [promoState, setPromoState] = useState<"idle" | "bad">("idle");

  if (!hydrated)
    return (
      <Loading label="Loading bag">
        <SplitSkeleton />
      </Loading>
    );

  const sum = cartSummary(cart);
  const shipping = business
    ? 0
    : sum.subtotal >= FREE_SHIPPING_THRESHOLD
      ? sum.shipping
      : Math.max(sum.shipping, 5.99);
  const tax = business && company.taxExempt ? 0 : sum.subtotal * TAX_RATE;
  const total = sum.subtotal + shipping + tax;
  const bySeller = cart.reduce<Record<string, CartLine[]>>((acc, l) => {
    const p = productById(l.productId);
    if (!p) return acc;
    (acc[p.sellerId] ??= []).push(l);
    return acc;
  }, {});
  const groups = Object.entries(bySeller);

  if (cart.length === 0) {
    return (
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="rounded-surface bg-white p-10 text-center shadow-[var(--shadow-hair)] sm:p-16">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mist">
            <Icon name="bag" size={24} />
          </span>
          <p className="display mt-6 text-display-sm">
            Your {business ? "cart" : "bag"} is empty.
          </p>
          <p className="mx-auto mt-3 max-w-sm text-body text-mute">
            Everything you add shows its exact delivery date and total cost here
            — no surprises later.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/search" className="btn btn-primary">
              Start discovering
            </Link>
            {business && (
              <Link href="/business?tab=lists" className="btn btn-secondary">
                Reorder a list
              </Link>
            )}
          </div>
        </div>
        {saved.length > 0 && <SavedList />}
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
      <div className="space-y-6">
        {groups.map(([sellerId, lines], gi) => {
          const seller = sellerById(sellerId);
          const slowest = lines
            .map((l) => productById(l.productId)!)
            .sort((a, b) => b.delivery.max - a.delivery.max)[0];
          return (
            <section
              key={sellerId}
              aria-label={`Shipment ${gi + 1}`}
              className="overflow-hidden rounded-surface bg-white shadow-[var(--shadow-hair)]"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4 sm:px-6">
                <p className="text-support">
                  <span className="font-medium">
                    Shipment {gi + 1} of {groups.length}
                  </span>
                  <span className="text-mute"> · from {seller.name}</span>
                </p>
                <p className="flex items-center gap-2 text-support">
                  <SignalDot live /> Arrives{" "}
                  <span className="font-medium">{deliveryLabel(slowest)}</span>
                </p>
              </header>
              <ul className="divide-y divide-line">
                {lines.map((l) => (
                  <Line key={l.key} line={l} business={business} />
                ))}
              </ul>
            </section>
          );
        })}
        {business && (
          <button
            type="button"
            onClick={() => {
              const id = createList(
                `Cart saved ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
              );
              cart.forEach((l) =>
                addToList(id, l.productId, l.variantId, l.qty),
              );
              notify(
                "Saved as a procurement list",
                "Reorder it in one click, or put it on a schedule.",
                { label: "View", href: "/business?tab=lists" },
              );
            }}
            className="chip !h-10"
          >
            <Icon name="list" size={15} /> Save cart as a reorder list
          </button>
        )}
        {saved.length > 0 && <SavedList onMove={moveToCart} />}
      </div>

      <aside
        aria-label="Order summary"
        className="lg:sticky lg:top-[88px] lg:self-start"
      >
        <div className="rounded-surface bg-white p-6 shadow-[var(--shadow-hair)]">
          <p className="text-emphasis font-medium tracking-[-0.02em]">
            Summary
          </p>
          <dl className="mt-5 space-y-2.5 text-support">
            <div className="flex justify-between">
              <dt className="text-ink-2">Items ({sum.count})</dt>
              <dd className="num">{fmt(sum.listTotal, { cents: true })}</dd>
            </div>
            {sum.volumeSavings > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-2">Volume & contract savings</dt>
                <dd className="num text-sale">
                  −{fmt(sum.volumeSavings, { cents: true })}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-2">Delivery</dt>
              <dd className="num">
                {shipping ? fmt(shipping, { cents: true }) : "Free"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-2">
                {business ? "Tax (exempt)" : "Estimated tax"}
              </dt>
              <dd className="num">
                {business ? fmt(0) : fmt(tax, { cents: true })}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3 text-body font-medium">
              <dt>Total</dt>
              <dd className="num text-section tracking-[-0.02em]">
                {fmt(total, { cents: true })}
              </dd>
            </div>
          </dl>
          {!business && sum.subtotal < FREE_SHIPPING_THRESHOLD && (
            <p className="mt-3 rounded-control bg-mist px-3 py-2 text-meta text-ink-2">
              Add{" "}
              <span className="num font-medium">
                {fmt(FREE_SHIPPING_THRESHOLD - sum.subtotal, { cents: true })}
              </span>{" "}
              for free delivery.
            </p>
          )}
          {business && (
            <p className="mt-3 rounded-control bg-info-soft px-3 py-2 text-meta text-info">
              {total > 2500
                ? "Over $2,500 — this order will route to Priya Raman for approval."
                : "Within your $2,500 limit — no approval needed."}
            </p>
          )}
          <Link href="/checkout" className="btn btn-primary mt-5 w-full">
            <Icon name="lock" size={16} />{" "}
            {business
              ? total > 2500
                ? "Continue to approval"
                : "Checkout on Net 30"
              : "Checkout"}
          </Link>
          {!business && (
            <p className="mt-3 text-center text-meta text-mute">
              No account needed · Pay with card, wallet or PayPal
            </p>
          )}
          {!business && (
            <form
              className="mt-5 flex gap-2 border-t border-line pt-5"
              onSubmit={(e) => {
                e.preventDefault();
                setPromoState("bad");
              }}
            >
              <label htmlFor="promo" className="sr-only">
                Promo code
              </label>
              <input
                id="promo"
                value={promo}
                onChange={(e) => {
                  setPromo(e.target.value);
                  setPromoState("idle");
                }}
                placeholder="Promo code"
                className="field !h-10 flex-1 !text-support"
              />
              <button type="submit" disabled={!promo} className="btn btn-ghost">
                Apply
              </button>
            </form>
          )}
          {promoState === "bad" && (
            <p className="mt-2 text-meta text-danger" role="alert">
              That code isn&apos;t valid. Prices shown are already the best
              available.
            </p>
          )}
        </div>
        <ul className="mt-4 space-y-2 px-2 text-meta text-mute">
          <li className="flex items-center gap-2">
            <Icon name="returns" size={14} /> Free 30-day returns on Ayiin
            Assured items
          </li>
          <li className="flex items-center gap-2">
            <Icon name="shield" size={14} /> Payment protected until delivery
          </li>
        </ul>
      </aside>
    </div>
  );
}

function Line({ line, business }: { line: CartLine; business: boolean }) {
  const { fmt } = usePrefs();
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.removeLine);
  const save = useShop((s) => s.saveForLater);
  const p = productById(line.productId)!;
  const variant =
    p.variants.find((v) => v.id === line.variantId) ?? p.variants[0];
  const unit = lineUnitPrice(line);
  const nt = line.business ? nextTier(p, line.qty) : undefined;
  return (
    <li className="flex gap-4 p-5 sm:gap-5 sm:p-6">
      <Link
        href={`/p/${p.slug}`}
        aria-label={p.name}
        tabIndex={-1}
        className="shrink-0"
      >
        <ProductImage
          product={p}
          variant={variant.id}
          sizes="112px"
          className="h-24 w-24 rounded-surface sm:h-28 sm:w-28"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
          <div>
            <Link
              href={`/p/${p.slug}`}
              className="text-body font-medium leading-snug hover:underline"
            >
              {p.name}
            </Link>
            <p className="mt-0.5 text-support text-mute">
              {variant.name}
              {business && (
                <>
                  {" "}
                  · <span className="num">{p.b2b.sku}</span>
                </>
              )}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="num text-body font-medium">
              {fmt(unit * line.qty, { cents: true })}
            </p>
            {line.qty > 1 && (
              <p className="num text-meta text-mute">
                {fmt(unit, { cents: true })} each
              </p>
            )}
          </div>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-support text-ink-2">
          <SignalDot /> Arrives {deliveryLabel(p)} ·{" "}
          {p.returns.free
            ? `Free returns for ${p.returns.days} days`
            : `${p.returns.days}-day returns`}
        </p>
        {nt && (
          <p className="mt-1 text-meta text-info">
            Add {nt.min - line.qty} more for {fmt(nt.price, { cents: true })}/
            {p.b2b.unit}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <QtyStepper
            value={line.qty}
            onChange={(q) => setQty(line.key, q)}
            size="sm"
            allowZero
            label={`Quantity of ${p.name}`}
          />
          <button
            type="button"
            onClick={() => save(line.key)}
            className="text-support text-mute hover:text-ink"
          >
            Save for later
          </button>
          <button
            type="button"
            onClick={() => remove(line.key)}
            className="text-support text-mute hover:text-ink"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

function SavedList({ onMove }: { onMove?: (key: string) => void }) {
  const saved = useShop((s) => s.saved);
  const moveToCart = useShop((s) => s.moveToCart);
  const move = onMove ?? moveToCart;
  return (
    <section
      aria-label="Saved for later"
      className="rounded-surface bg-white p-5 shadow-[var(--shadow-hair)] sm:p-6"
    >
      <p className="text-body font-medium">
        Saved for later <span className="text-mute">({saved.length})</span>
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {saved.map((l) => {
          const p = productById(l.productId);
          if (!p) return null;
          return (
            <li
              key={l.key}
              className={clsx(
                "flex items-center gap-3 rounded-surface bg-porcelain p-2.5",
              )}
            >
              <ProductImage
                product={p}
                sizes="56px"
                className="h-14 w-14 shrink-0 rounded-control"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-support font-medium">{p.name}</p>
                <button
                  type="button"
                  onClick={() => move(l.key)}
                  className="text-meta text-ink-2 underline-offset-2 hover:underline"
                >
                  Move to bag
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
