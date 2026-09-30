"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { ProductImage } from "@/components/product/product-image";
import { usePrefs } from "@/components/providers";
import { cartSummary, lineUnitPrice, useHydrated, useShop, useUI, type CartLine } from "@/lib/store";
import { productById, products } from "@/lib/catalog/products";
import { deliveryLabel, FREE_SHIPPING_THRESHOLD, nextTier } from "@/lib/commerce";
import { SignalDot } from "@/components/ui/signal";
import { QtyStepper } from "@/components/ui/qty-stepper";

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const close = useUI((s) => s.closeCart);
  const hydrated = useHydrated();
  const cart = useShop((s) => s.cart);
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const panelRef = useRef<HTMLDivElement>(null);
  const lines = hydrated ? cart : [];
  const sum = cartSummary(lines);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - sum.subtotal);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
  }, [open, close]);

  return (
    <>
      <div
        aria-hidden
        onClick={close}
        className={clsx("fixed inset-0 z-[70] bg-ink/30 backdrop-blur-[2px] transition-opacity duration-500", open ? "opacity-100" : "pointer-events-none opacity-0")}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        inert={!open}
        className={clsx(
          "fixed inset-y-0 right-0 z-[71] flex w-full max-w-[460px] flex-col bg-porcelain outline-none transition-transform duration-500 ease-[var(--ease-out-expo)] sm:inset-y-2 sm:right-2 sm:rounded-[28px] sm:shadow-[var(--shadow-float)]",
          open ? "translate-x-0" : "translate-x-[105%]",
        )}
      >
        <div className="flex items-center justify-between px-6 pb-4 pt-5">
          <div>
            <h2 className="text-[20px] font-medium tracking-[-0.02em]">
              {business ? "Purchase cart" : "Your bag"} <span className="num text-mute">({sum.count})</span>
            </h2>
            {business && <p className="text-[12.5px] text-mute">Northwind Studio · Contract & volume pricing applied</p>}
          </div>
          <button type="button" aria-label="Close bag" onClick={close} className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft">
            <Icon name="close" size={20} />
          </button>
        </div>

        {!business && lines.length > 0 && (
          <div className="mx-6 mb-3 rounded-2xl bg-white p-3.5 shadow-[var(--shadow-hair)]">
            <p className="text-[13px] text-ink-2">
              {remaining > 0 ? (
                <>
                  <span className="num font-medium text-ink">{fmt(remaining)}</span> away from free delivery
                </>
              ) : (
                <span className="flex items-center gap-2 font-medium text-ink">
                  <SignalDot /> Free delivery unlocked — no surprises at checkout
                </span>
              )}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft">
              <div
                className="bg-brand-gradient h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-expo)]"
                style={{ width: `${Math.min(100, (sum.subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`, boxShadow: "inset 0 0 0 1px rgb(var(--rgb-ink) / 0.12)" }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 thin-scroll">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-[var(--shadow-hair)]">
                <Icon name="bag" size={26} />
              </div>
              <p className="mt-5 text-[17px] font-medium">Nothing here yet</p>
              <p className="mt-1 max-w-[260px] text-[14px] text-mute">Items you add appear here with their exact delivery date and total cost.</p>
              <Link href="/search" onClick={close} className="btn btn-ink btn-sm mt-6">
                Start discovering
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-line">
                {lines.map((l) => (
                  <DrawerLine key={l.key} line={l} business={business} />
                ))}
              </ul>
              {!business && <PairsWell lines={lines} remaining={remaining} />}
            </>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-line bg-porcelain px-6 pb-6 pt-4 sm:rounded-b-[28px]">
            <dl className="space-y-1.5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-ink-2">Subtotal</dt>
                <dd className="num">{fmt(sum.subtotal, { cents: true })}</dd>
              </div>
              {sum.volumeSavings > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-2">Volume savings</dt>
                  <dd className="num text-sale">−{fmt(sum.volumeSavings, { cents: true })}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-2">Delivery</dt>
                <dd className="num">{sum.shipping > 0 ? fmt(sum.shipping) : remaining > 0 && !business ? fmt(5.99) : "Free"}</dd>
              </div>
              <div className="flex justify-between pt-1.5 text-[16px] font-medium">
                <dt>Total {business ? "(excl. tax)" : ""}</dt>
                <dd className="num">{fmt(sum.subtotal + (sum.shipping || (remaining > 0 && !business ? 5.99 : 0)), { cents: true })}</dd>
              </div>
            </dl>
            <p className="mt-1 text-[12px] text-mute">{business ? "Tax calculated from your exemption certificate at checkout." : "Taxes calculated at checkout. No hidden fees."}</p>
            <div className="mt-4 grid gap-2">
              <Link href="/checkout" onClick={close} className="btn btn-brand btn-lg w-full">
                <Icon name="lock" size={16} />
                {business ? "Checkout with PO or terms" : "Checkout — no account needed"}
              </Link>
              <Link href="/cart" onClick={close} className="btn btn-ghost w-full">
                {business ? "Review cart & send for approval" : "View bag"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function DrawerLine({ line, business }: { line: CartLine; business: boolean }) {
  const { fmt } = usePrefs();
  const setQty = useShop((s) => s.setQty);
  const remove = useShop((s) => s.removeLine);
  const save = useShop((s) => s.saveForLater);
  const close = useUI((s) => s.closeCart);
  const p = productById(line.productId);
  if (!p) return null;
  const variant = p.variants.find((v) => v.id === line.variantId) ?? p.variants[0];
  const unit = lineUnitPrice(line);
  const nt = line.business ? nextTier(p, line.qty) : undefined;
  return (
    <li className="flex gap-4 py-4">
      <Link href={`/p/${p.slug}`} onClick={close} aria-label={p.name} tabIndex={-1} className="shrink-0">
        <ProductImage product={p} variant={variant.id} sizes="96px" className="h-24 w-24 rounded-2xl" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3">
          <Link href={`/p/${p.slug}`} onClick={close} className="text-[14.5px] font-medium leading-snug hover:underline">
            {p.name}
          </Link>
          <span className="num shrink-0 text-[14.5px] font-medium">{fmt(unit * line.qty, { cents: true })}</span>
        </div>
        <p className="mt-0.5 text-[12.5px] text-mute">
          {variant.name}
          {line.business && (
            <>
              {" "}· <span className="num">{fmt(unit, { cents: true })}</span>/{p.b2b.unit}
            </>
          )}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink-2">
          <SignalDot /> Arrives {deliveryLabel(p)}
        </p>
        {nt && business && (
          <p className="mt-1 text-[12px] text-info">
            Add {nt.min - line.qty} more for <span className="num">{fmt(nt.price, { cents: true })}</span>/unit
          </p>
        )}
        <div className="mt-2.5 flex items-center justify-between">
          <QtyStepper value={line.qty} onChange={(q) => setQty(line.key, q)} size="sm" allowZero label={`Quantity for ${p.name}`} />
          <div className="flex gap-3 text-[12.5px] text-mute">
            <button type="button" onClick={() => save(line.key)} className="hover:text-ink">
              Save for later
            </button>
            <button type="button" onClick={() => remove(line.key)} className="hover:text-ink">
              Remove
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}

/** A few relevant add-ons — preferring ones that close the gap to free delivery. */
function PairsWell({ lines, remaining }: { lines: CartLine[]; remaining: number }) {
  const { fmt } = usePrefs();
  const addToCart = useShop((s) => s.addToCart);
  const inCart = new Set(lines.map((l) => l.productId));
  const cats = new Set(lines.map((l) => productById(l.productId)?.category));
  const picks = products
    .filter((p) => !inCart.has(p.id) && !["supplies", "safety", "office"].includes(p.category))
    .map((p) => ({ p, score: (cats.has(p.category) ? 2 : 0) + (remaining > 0 && p.price >= remaining && p.price <= remaining + 60 ? 2 : 0) + (p.price < 80 ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || b.p.soldLastWeek - a.p.soldLastWeek)
    .slice(0, 3)
    .map((x) => x.p);
  if (!picks.length) return null;
  return (
    <section aria-labelledby="pairs-h" className="mt-2 border-t border-line py-5">
      <h3 id="pairs-h" className="flex items-baseline justify-between gap-3 text-[14px] font-medium">
        Pairs well with
        {remaining > 0 && <span className="text-[12px] font-normal text-mute">Any of these unlocks free delivery</span>}
      </h3>
      <ul className="mt-3 space-y-2">
        {picks.map((p) => (
          <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-3 shadow-[var(--shadow-hair)]">
            <ProductImage product={p} sizes="56px" className="h-14 w-14 shrink-0 rounded-xl" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
              <span className="text-[12.5px] text-mute">
                <span className="num text-ink-2">{fmt(p.price)}</span> · {deliveryLabel(p)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => addToCart(p.id, p.variants[0].id, 1, false)}
              aria-label={`Add ${p.name} to bag`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-transform hover:scale-105"
            >
              <Icon name="plus" size={16} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
