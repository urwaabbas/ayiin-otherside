"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { ProductImage } from "@/components/product/product-image";
import { usePrefs } from "@/components/providers";
import {
  cartSummary,
  lineUnitPrice,
  useHydrated,
  useShop,
  useUI,
  type CartLine,
} from "@/lib/store";
import { productById, products } from "@/lib/catalog/products";
import {
  deliveryLabel,
  FREE_SHIPPING_THRESHOLD,
  nextTier,
} from "@/lib/commerce";
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
        className={clsx(
          "fixed inset-0 z-[70] bg-ink/30 backdrop-blur-[2px] transition-opacity duration-500",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        inert={!open}
        className={clsx(
          "fixed inset-y-0 right-0 z-[71] flex w-full max-w-[460px] flex-col bg-porcelain outline-none transition-transform duration-500 ease-[var(--ease-out-expo)] sm:inset-y-2 sm:right-2 sm:rounded-surface sm:shadow-[var(--shadow-float)]",
          open ? "translate-x-0" : "translate-x-[105%]",
        )}
      >
        <div className="flex items-center justify-between px-6 pb-3 pt-5">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-emphasis font-medium tracking-[-0.02em]">
              {business ? "Purchase cart" : "Your cart"}
              <span className="num inline-flex items-center rounded-full bg-mist px-2.5 py-0.5 text-meta font-medium text-ink-2">({sum.count})</span>
            </h2>
            {business && (
              <p className="mt-0.5 truncate text-meta text-mute">Northwind Studio · Contract & volume pricing</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close bag"
            onClick={close}
            suppressHydrationWarning
            className="grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-soft"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {!business && lines.length > 0 && (
          <div className="px-6 pb-4">
            <p className="flex items-center gap-2 text-support text-ink-2">
              {remaining > 0 ? (
                <>
                  <Icon name="truck" size={15} className="text-mute" />
                  <span>
                    <span className="num font-medium text-ink">{fmt(remaining)}</span> to free delivery
                  </span>
                </>
              ) : (
                <>
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-success-soft text-success">
                    <Icon name="check" size={11} />
                  </span>
                  <span className="font-medium text-ink">Free delivery unlocked</span>
                </>
              )}
            </p>
            <div className="relative mt-2.5 h-1 rounded-full bg-soft">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: "var(--gradient-brand)" }}
                initial={false}
                animate={{ width: `${Math.min(100, (sum.subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 thin-scroll">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center pb-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-brand-deep ring-1 ring-brand/30">
                <Icon name="bag" size={26} />
              </div>
              <p className="mt-5 text-body font-medium">Your cart is empty</p>
              <p className="mt-1 max-w-[260px] text-support text-mute">
                Add something and you will see its delivery date and total here.
              </p>
              <Link
                href="/search"
                onClick={close}
                className="btn btn-primary mt-6"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <>
              <ul className="border-t border-line">
                <AnimatePresence initial={false}>
                  {lines.map((l) => (
                    <DrawerLine key={l.key} line={l} business={business} />
                  ))}
                </AnimatePresence>
              </ul>
              {!business && <PairsWell lines={lines} remaining={remaining} />}
            </>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-line bg-white px-6 pb-5 pt-4 sm:rounded-b-surface">
            <dl className="space-y-1.5 text-support">
              <div className="flex justify-between">
                <dt className="text-mute">Subtotal</dt>
                <dd className="num">{fmt(sum.subtotal, { cents: true })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mute">Delivery</dt>
                <dd className="num">
                  {sum.shipping > 0
                    ? fmt(sum.shipping)
                    : remaining > 0 && !business
                      ? fmt(5.99)
                      : "Free"}
                </dd>
              </div>
              {sum.volumeSavings > 0 && (
                <div className="flex items-center justify-between pt-0.5">
                  <dt>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-1 text-meta font-medium text-brand-deep">
                      <Icon name="percent" size={12} /> You save <span className="num">{fmt(sum.volumeSavings, { cents: true })}</span>
                    </span>
                  </dt>
                  <dd className="text-meta text-mute">volume pricing</dd>
                </div>
              )}
            </dl>
            <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
              <span className="text-body font-medium">Total{business ? " (excl. tax)" : ""}</span>
              <span className="num text-section font-medium tracking-[-0.02em]">
                {fmt(sum.subtotal + (sum.shipping || (remaining > 0 && !business ? 5.99 : 0)), { cents: true })}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="group relative mt-4 flex h-[3.25rem] w-full items-center justify-center gap-2.5 overflow-hidden rounded-control text-body font-semibold text-ink shadow-[0_10px_24px_-12px_rgb(var(--rgb-brand)/0.8)] transition-transform duration-300 active:scale-[0.99]"
              style={{ background: "var(--gradient-brand)" }}
            >
              <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-full" />
              <Icon name="lock" size={16} className="relative" />
              <span className="relative">{business ? "Checkout with PO or terms" : "Checkout"}</span>
            </Link>
            <div className="mt-3 flex items-center justify-between gap-3 text-meta text-mute">
              <span>{business ? "Tax from your exemption certificate" : "No account needed · Tax at checkout"}</span>
              <Link href="/cart" onClick={close} className="shrink-0 font-medium text-ink underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:text-brand-deep">
                {business ? "Review & send for approval" : "View cart"}
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
  const variant =
    p.variants.find((v) => v.id === line.variantId) ?? p.variants[0];
  const unit = lineUnitPrice(line);
  const nt = line.business ? nextTier(p, line.qty) : undefined;
  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, height: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex gap-3.5 overflow-hidden border-b border-line py-4"
    >
      <Link href={`/p/${p.slug}`} onClick={close} aria-label={p.name} tabIndex={-1} className="shrink-0">
        <ProductImage product={p} variant={variant.id} sizes="80px" className="h-20 w-20 rounded-control" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex justify-between gap-3">
          <Link href={`/p/${p.slug}`} onClick={close} className="text-support font-medium leading-snug transition-colors hover:text-brand-deep">
            {p.name}
          </Link>
          <span className="num shrink-0 text-support font-medium">{fmt(unit * line.qty, { cents: true })}</span>
        </div>
        <p className="mt-0.5 text-meta text-mute">
          {variant.name}
          {line.business && (
            <>
              {" "}
              · <span className="num">{fmt(unit, { cents: true })}</span>/{p.b2b.unit}
            </>
          )}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-meta text-ink-2">
          <Icon name="truck" size={13} className="text-mute" /> Arrives {deliveryLabel(p)}
        </p>
        {nt && business && (
          <p className="mt-1 text-meta text-info">
            Add {nt.min - line.qty} more for <span className="num">{fmt(nt.price, { cents: true })}</span>/unit
          </p>
        )}
        <div className="mt-2.5 flex items-center justify-between gap-3">
          <QtyStepper value={line.qty} onChange={(q) => setQty(line.key, q)} size="sm" allowZero label={`Quantity for ${p.name}`} />
          <div className="flex gap-1 text-meta text-mute">
            <button type="button" onClick={() => save(line.key)} className="rounded-full px-2.5 py-1.5 transition-colors hover:bg-soft hover:text-ink">
              Save
            </button>
            <button type="button" onClick={() => remove(line.key)} className="rounded-full px-2.5 py-1.5 transition-colors hover:bg-soft hover:text-ink">
              Remove
            </button>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

/** A few relevant add-ons — preferring ones that close the gap to free delivery. */
function PairsWell({
  lines,
  remaining,
}: {
  lines: CartLine[];
  remaining: number;
}) {
  const { fmt } = usePrefs();
  const addToCart = useShop((s) => s.addToCart);
  const inCart = new Set(lines.map((l) => l.productId));
  const cats = new Set(lines.map((l) => productById(l.productId)?.category));
  const picks = products
    .filter(
      (p) =>
        !inCart.has(p.id) &&
        !["supplies", "safety", "office"].includes(p.category),
    )
    .map((p) => ({
      p,
      score:
        (cats.has(p.category) ? 2 : 0) +
        (remaining > 0 && p.price >= remaining && p.price <= remaining + 60
          ? 2
          : 0) +
        (p.price < 80 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score || b.p.soldLastWeek - a.p.soldLastWeek)
    .slice(0, 3)
    .map((x) => x.p);
  if (!picks.length) return null;
  return (
    <section
      aria-labelledby="pairs-h"
      className="py-5"
    >
      <h3
        id="pairs-h"
        className="flex items-baseline justify-between gap-3 text-support font-medium"
      >
        {remaining > 0 ? "Add to unlock free delivery" : "You might also like"}
      </h3>
      <ul className="mt-3 space-y-2">
        {picks.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-surface bg-white p-2 pr-3 shadow-[var(--shadow-hair)] transition-shadow hover:shadow-[var(--shadow-soft)]"
          >
            <ProductImage
              product={p}
              sizes="56px"
              className="h-14 w-14 shrink-0 rounded-control"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-support font-medium">
                {p.name}
              </span>
              <span className="text-meta text-mute">
                <span className="num text-ink-2">{fmt(p.price)}</span> ·{" "}
                {deliveryLabel(p)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => addToCart(p.id, p.variants[0].id, 1, false)}
              aria-label={`Add ${p.name} to bag`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-ink transition-[transform,background-color] hover:scale-105 hover:bg-brand-hover active:scale-95"
            >
              <Icon name="plus" size={16} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
