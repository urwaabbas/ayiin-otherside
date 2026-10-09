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
      <Loading label="Loading cart">
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
  const remainingForFreeDelivery = Math.max(0, FREE_SHIPPING_THRESHOLD - sum.subtotal);
  const freeUnlocked = remainingForFreeDelivery <= 0;

  if (cart.length === 0) {
    return (
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="rounded-panel border border-line/70 bg-white p-10 text-center shadow-[var(--shadow-hair)] sm:p-16">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mist text-mute">
            <Icon name="bag" size={26} />
          </span>
          <h2 className="font-display mt-6 text-display-sm text-ink font-semibold">
            Your {business ? "cart" : "bag"} is empty
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-body text-mute leading-relaxed">
            Everything you add shows its exact delivery date and transparent pricing upfront — no surprises at checkout.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/search" className="btn btn-primary rounded-full px-8">
              Start Discovering
            </Link>
            {business && (
              <Link href="/business?tab=lists" className="btn btn-secondary rounded-full px-8">
                Reorder a List
              </Link>
            )}
          </div>
        </div>
        {saved.length > 0 && <SavedList onMove={moveToCart} />}
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
      {/* ── Left Column: Items List ── */}
      <div className="space-y-4">
        {/* Free Delivery Banner (Clean, no yellow dots) */}
        {!business && (
          <div
            className={clsx(
              "overflow-hidden rounded-surface border p-4 transition-all shadow-[var(--shadow-hair)]",
              freeUnlocked
                ? "border-success/30 bg-gradient-to-r from-success-soft/60 via-white to-success-soft/30"
                : "border-line bg-white",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={clsx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    freeUnlocked
                      ? "bg-success text-white"
                      : "bg-mist text-mute",
                  )}
                >
                  <Icon name={freeUnlocked ? "check" : "truck"} size={14} />
                </div>
                <p className="text-support text-ink font-medium">
                  {freeUnlocked ? (
                    "Free Express Delivery unlocked — no hidden handling or surprise fees"
                  ) : (
                    <>
                      Add{" "}
                      <span className="num font-semibold text-brand-deep">
                        {fmt(remainingForFreeDelivery)}
                      </span>{" "}
                      more to unlock Free Express Delivery
                    </>
                  )}
                </p>
              </div>

              {freeUnlocked && (
                <span className="shrink-0 rounded-full bg-success-soft px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-success">
                  UNLOCKED
                </span>
              )}
            </div>

            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-soft">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-orange via-brand to-brand-yellow transition-[width] duration-700 ease-[var(--ease-out-expo)]"
                style={{
                  width: `${Math.min(100, (sum.subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Clean, spacious Cart Line Cards */}
        <div className="space-y-3">
          {cart.map((line) => (
            <CartItemCard key={line.key} line={line} business={business} />
          ))}
        </div>

        {/* Business Procurement List Action */}
        {business && (
          <div className="pt-2">
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
                  "Saved as procurement list",
                  "Reorder anytime with 1 click or add to schedule.",
                  { label: "View", href: "/business?tab=lists" },
                );
              }}
              className="chip !h-10 border border-line-strong hover:bg-mist transition-colors"
            >
              <Icon name="list" size={15} /> Save cart as a reorder list
            </button>
          </div>
        )}

        {/* Saved for Later Section */}
        {saved.length > 0 && <SavedList onMove={moveToCart} />}
      </div>

      {/* ── Right Column: Order Summary ── */}
      <aside
        aria-label="Order summary"
        className="lg:sticky lg:top-[96px] lg:self-start"
      >
        <div className="rounded-panel border border-line/80 bg-white p-6 sm:p-7 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between border-b border-line/60 pb-4">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink">
              Order Summary
            </h2>
            <span className="font-mono text-meta text-mute">
              {sum.count} {sum.count === 1 ? "item" : "items"}
            </span>
          </div>

          <dl className="mt-5 space-y-3 text-support">
            {sum.volumeSavings > 0 ? (
              <>
                <div className="flex justify-between text-mute">
                  <dt>Items list price</dt>
                  <dd className="num line-through">{fmt(sum.listTotal, { cents: true })}</dd>
                </div>
                <div className="flex justify-between text-brand-deep font-medium">
                  <dt className="flex items-center gap-1.5">
                    <Icon name="tag" size={13} /> Volume tier discount
                  </dt>
                  <dd className="num">−{fmt(sum.volumeSavings, { cents: true })}</dd>
                </div>
                <div className="flex justify-between text-ink-2">
                  <dt>Subtotal</dt>
                  <dd className="num font-semibold text-ink">{fmt(sum.subtotal, { cents: true })}</dd>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-ink-2">
                <dt>Subtotal</dt>
                <dd className="num font-semibold text-ink">{fmt(sum.subtotal, { cents: true })}</dd>
              </div>
            )}

            <div className="flex justify-between text-ink-2">
              <dt>Express Delivery</dt>
              <dd className="num">
                {shipping === 0 ? (
                  <span className="font-semibold text-success">Free</span>
                ) : (
                  fmt(shipping, { cents: true })
                )}
              </dd>
            </div>

            <div className="flex justify-between text-ink-2">
              <dt>
                {business ? "Tax (exemption applied)" : "Estimated Tax"}
              </dt>
              <dd className="num">
                {business ? (
                  <span className="font-mono text-meta text-mute">$0.00 (Exempt)</span>
                ) : (
                  fmt(tax, { cents: true })
                )}
              </dd>
            </div>

            {/* Total Row */}
            <div className="flex items-baseline justify-between border-t border-line/80 pt-4">
              <div>
                <dt className="font-display text-base font-semibold text-ink">
                  Total
                </dt>
                <dd className="text-meta text-mute">
                  {business
                    ? "Exemption certificate applied"
                    : "No surprise fees at checkout"}
                </dd>
              </div>
              <dd className="num font-display text-2xl font-bold tracking-tight text-ink">
                {fmt(total, { cents: true })}
              </dd>
            </div>
          </dl>

          {/* Business Limit / Approval Guidance */}
          {business && (
            <div className="mt-4 rounded-surface border border-info/20 bg-info-soft p-3 text-meta text-info">
              {total > 2500
                ? "Order exceeds $2,500 — will route automatically to department head for 1-click approval."
                : "Within your $2,500 pre-approved limit — instant purchase order dispatch."}
            </div>
          )}

          {/* Checkout CTA */}
          <div className="mt-6">
            <Link
              href="/checkout"
              className="group flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-brand px-6 font-semibold text-ink shadow-[0_12px_24px_-8px_rgba(255,166,36,0.6)] transition-all hover:bg-brand-hover hover:shadow-brand/35 active:scale-[0.99]"
            >
              <Icon name="lock" size={16} />
              <span>
                {business
                  ? total > 2500
                    ? "Continue to Approval"
                    : "Checkout on Net-30 Terms"
                  : "Proceed to Checkout"}
              </span>
              <Icon
                name="arrowRight"
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* Secondary Info */}
          {!business && (
            <p className="mt-3 text-center font-mono text-[11px] text-mute">
              No account required · Guest checkout available
            </p>
          )}

          {/* Promo code form */}
          {!business && (
            <form
              className="mt-5 border-t border-line/60 pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                setPromoState("bad");
              }}
            >
              <div className="flex gap-2">
                <label htmlFor="cart-promo" className="sr-only">
                  Promo code
                </label>
                <input
                  id="cart-promo"
                  value={promo}
                  onChange={(e) => {
                    setPromo(e.target.value);
                    setPromoState("idle");
                  }}
                  placeholder="Enter promo code"
                  className="field !h-10 flex-1 text-support rounded-control"
                />
                <button
                  type="submit"
                  disabled={!promo}
                  className="btn btn-secondary h-10 px-4 text-support rounded-control disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
              {promoState === "bad" && (
                <p className="mt-2 text-meta text-danger" role="alert">
                  Invalid code. Current prices are already verified best direct rates.
                </p>
              )}
            </form>
          )}

          {/* Trust Guarantees */}
          <div className="mt-5 space-y-2 border-t border-line/60 pt-4 text-meta text-mute">
            <div className="flex items-center gap-2">
              <Icon name="shield" size={15} className="text-brand-deep" />
              <span>100% Authentic designer items direct from ateliers</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="returns" size={15} className="text-brand-deep" />
              <span>Free 30-day returns on all Ayiin Assured orders</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="truck" size={15} className="text-brand-deep" />
              <span>Express air freight to US in 3–5 business days</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

/**
 * Individual product card on the main Cart Page.
 * Beautiful, spacious layout with clean controls and zero yellowish dots.
 */
function CartItemCard({
  line,
  business,
}: {
  line: CartLine;
  business: boolean;
}) {
  const { fmt } = usePrefs();
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.removeLine);
  const save = useShop((s) => s.saveForLater);

  const p = productById(line.productId);
  if (!p) return null;

  const seller = sellerById(p.sellerId);
  const variant =
    p.variants.find((v) => v.id === line.variantId) ?? p.variants[0];
  const unit = lineUnitPrice(line);
  const nt = line.business ? nextTier(p, line.qty) : undefined;

  return (
    <div className="group rounded-surface border border-line bg-white p-4.5 sm:p-5 shadow-[var(--shadow-hair)] transition-all hover:border-line-hover hover:shadow-[var(--shadow-soft)]">
      <div className="flex gap-4 sm:gap-5">
        {/* Thumbnail */}
        <Link
          href={`/p/${p.slug}`}
          aria-label={p.name}
          className="relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-surface bg-mist border border-line/50"
        >
          <ProductImage
            product={p}
            variant={variant.id}
            sizes="112px"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Product Details */}
        <div className="min-w-0 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start sm:gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute font-semibold">
                    {p.brand}
                  </span>
                  <span className="text-line-strong">·</span>
                  <span className="font-mono text-[10px] uppercase text-mute">
                    via {seller.name}
                  </span>
                </div>
                <Link
                  href={`/p/${p.slug}`}
                  className="mt-0.5 block font-display text-base font-semibold text-ink leading-snug hover:text-brand-deep transition-colors"
                >
                  {p.name}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-meta text-mute">
                  <span className="inline-flex items-center rounded bg-mist px-2 py-0.5 text-xs text-ink-2 font-medium">
                    {variant.name}
                  </span>
                  {business && (
                    <span className="font-mono text-meta">
                      SKU: {p.b2b.sku} · {fmt(unit, { cents: true })}/{p.b2b.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-left sm:text-right mt-1 sm:mt-0">
                <span className="num font-semibold text-lg text-ink">
                  {fmt(unit * line.qty, { cents: true })}
                </span>
                {line.qty > 1 && (
                  <span className="block font-mono text-meta text-mute">
                    {fmt(unit, { cents: true })} each
                  </span>
                )}
              </div>
            </div>

            {/* Delivery & Returns status (Clean, no yellow dots) */}
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-ink-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-mist/80 px-2.5 py-0.5 font-medium">
                <Icon name="truck" size={13} className="text-mute" />
                <span>Arrives {deliveryLabel(p)}</span>
              </div>
              <span className="text-mute">·</span>
              <span className="text-mute">
                {p.returns.free ? "Free 30-day returns" : `${p.returns.days}-day returns`}
              </span>
            </div>

            {/* Volume Tier Opportunity */}
            {nt && business && (
              <p className="mt-1.5 text-meta text-info">
                Add {nt.min - line.qty} more for {fmt(nt.price, { cents: true })}/{p.b2b.unit}
              </p>
            )}
          </div>

          {/* Controls: Stepper and Actions */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line/50 pt-3">
            <QtyStepper
              value={line.qty}
              onChange={(q) => setQty(line.key, q)}
              size="sm"
              allowZero
              label={`Quantity of ${p.name}`}
            />

            <div className="flex items-center gap-4 text-support">
              <button
                type="button"
                onClick={() => save(line.key)}
                className="text-mute transition-colors hover:text-ink active:scale-95"
              >
                Save for later
              </button>
              <span className="text-line-strong">|</span>
              <button
                type="button"
                onClick={() => remove(line.key)}
                className="text-mute transition-colors hover:text-danger active:scale-95"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Saved for Later component */
function SavedList({ onMove }: { onMove?: (key: string) => void }) {
  const saved = useShop((s) => s.saved);
  const moveToCart = useShop((s) => s.moveToCart);
  const move = onMove ?? moveToCart;

  return (
    <section
      aria-label="Saved for later"
      className="mt-6 rounded-panel border border-line bg-white p-6 shadow-[var(--shadow-hair)]"
    >
      <div className="flex items-center justify-between border-b border-line/60 pb-3">
        <h3 className="font-display text-lg font-semibold text-ink">
          Saved for Later
        </h3>
        <span className="font-mono text-meta text-mute">
          ({saved.length})
        </span>
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {saved.map((l) => {
          const p = productById(l.productId);
          if (!p) return null;
          return (
            <li
              key={l.key}
              className="flex items-center gap-3.5 rounded-surface border border-line/70 bg-porcelain/60 p-3"
            >
              <ProductImage
                product={p}
                sizes="64px"
                className="h-16 w-16 shrink-0 rounded-control bg-white object-cover border border-line/40"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-support font-semibold text-ink">{p.name}</p>
                <p className="num text-meta text-mute mt-0.5">${p.price}</p>
                <button
                  type="button"
                  onClick={() => move(l.key)}
                  className="mt-1 text-meta font-medium text-brand-deep underline underline-offset-2 hover:text-ink transition-colors"
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
